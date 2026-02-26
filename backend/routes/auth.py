"""
Auth routes — sync Clerk user to MongoDB, get/update profile.
Clerk handles actual auth; these routes manage our local user records.
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from database import get_db
from middleware.clerk_auth import get_current_user_id
from models.user import UserCreate, UserProfile, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/sync", response_model=dict)
async def sync_user(user_data: UserCreate, user_id: str = Depends(get_current_user_id)):
    """
    Called after Clerk sign-in/sign-up to create or update
    the local user record in MongoDB.
    """
    db = get_db()

    existing = await db.users.find_one({"clerk_id": user_id})

    if existing:
        # Update existing user
        await db.users.update_one(
            {"clerk_id": user_id},
            {
                "$set": {
                    "email": user_data.email,
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "image_url": user_data.image_url,
                    "updated_at": datetime.utcnow(),
                }
            },
        )
        return {"message": "User synced", "is_new": False}
    else:
        # Create new user
        user_doc = {
            "clerk_id": user_id,
            "email": user_data.email,
            "first_name": user_data.first_name or "",
            "last_name": user_data.last_name or "",
            "image_url": user_data.image_url or "",
            "age": None,
            "gender": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db.users.insert_one(user_doc)
        return {"message": "User created", "is_new": True}


@router.get("/me", response_model=dict)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    """Get the current user's profile."""
    db = get_db()
    user = await db.users.find_one({"clerk_id": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sync first.")

    user["id"] = str(user["_id"])
    del user["_id"]
    return user


@router.put("/me", response_model=dict)
async def update_profile(updates: dict, user_id: str = Depends(get_current_user_id)):
    """Update the current user's profile (age, gender, etc.)."""
    db = get_db()

    # Only allow certain fields to be updated
    allowed = {"age", "gender", "first_name", "last_name", "phone_number"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    filtered["updated_at"] = datetime.utcnow()

    result = await db.users.update_one({"clerk_id": user_id}, {"$set": filtered})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Profile updated", "updated_fields": list(filtered.keys())}
