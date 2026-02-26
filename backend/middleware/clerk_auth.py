"""
Clerk JWT verification middleware.
Verifies tokens issued by Clerk using their JWKS endpoint.
Extracts the user's clerk_id (sub claim) for downstream use.
"""

import jwt
import httpx
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient
from config import get_settings

settings = get_settings()
security = HTTPBearer()

# Cache the JWKS client — recreated if key lookup fails (handles key rotation)
_jwks_client = None


def get_jwks_client(force_refresh: bool = False) -> PyJWKClient:
    """Return (or rebuild) the PyJWKClient."""
    global _jwks_client
    if _jwks_client is None or force_refresh:
        _jwks_client = PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True)
    return _jwks_client


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency that verifies a Clerk-issued JWT.
    Returns the decoded token payload containing sub (clerk user id).
    """
    token = credentials.credentials

    def _decode(jwks_client: PyJWKClient) -> dict:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER if settings.CLERK_ISSUER else None,
            leeway=30,  # 30-second clock-skew tolerance
            options={
                "verify_aud": False,  # Clerk doesn't always set aud
                "verify_iss": bool(settings.CLERK_ISSUER),
            },
        )

    try:
        try:
            return _decode(get_jwks_client())
        except jwt.exceptions.PyJWKClientError:
            # Key not found in cache — refresh JWKS and retry once
            return _decode(get_jwks_client(force_refresh=True))

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def get_current_user_id(
    payload: dict = Depends(verify_clerk_token),
) -> str:
    """Extract the Clerk user ID (sub) from a verified token."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: no subject")
    return user_id
