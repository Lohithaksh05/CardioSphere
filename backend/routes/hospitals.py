"""
Hospitals routes — find nearby CARDIAC hospitals / heart specialists using OpenStreetMap.
Only returns cardiology-tagged facilities or hospitals whose names indicate cardiac care.
No external API key required; uses the free Overpass turbo endpoint.
"""

import asyncio
import re
import httpx
import math
from fastapi import APIRouter, HTTPException, Query
from middleware.clerk_auth import get_current_user_id
from fastapi import Depends

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

# Multiple Overpass API mirrors — tried in order until one succeeds
OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
]

# ----------------------------------------------------------------------
# Overpass QL — two passes in one request:
#   1. Any healthcare node/way tagged with a cardiology-related speciality
#   2. Any hospital/clinic — will be further filtered in Python by name
# ----------------------------------------------------------------------
OVERPASS_QUERY_TEMPLATE = """
[out:json][timeout:30];
(
  node["healthcare:speciality"~"cardio|cardiac|heart|cardiovascular",i](around:{radius},{lat},{lng});
  way["healthcare:speciality"~"cardio|cardiac|heart|cardiovascular",i](around:{radius},{lat},{lng});
  node["speciality"~"cardio|cardiac|heart|cardiovascular",i](around:{radius},{lat},{lng});
  way["speciality"~"cardio|cardiac|heart|cardiovascular",i](around:{radius},{lat},{lng});
  node["amenity"="doctors"]["healthcare:speciality"~"cardio|cardiac|heart",i](around:{radius},{lat},{lng});
  way["amenity"="clinic"]["healthcare:speciality"~"cardio|cardiac|heart",i](around:{radius},{lat},{lng});
  node["amenity"="hospital"](around:{radius},{lat},{lng});
  way["amenity"="hospital"](around:{radius},{lat},{lng});
  node["healthcare"="hospital"](around:{radius},{lat},{lng});
  way["healthcare"="hospital"](around:{radius},{lat},{lng});
);
out center tags;
"""

# Cardiac keyword pattern — used to label the specialty badge
_CARDIAC_PATTERN = re.compile(
    r"cardio|cardiac|heart|cardiovascular|cardiology|coronary|vascular",
    re.IGNORECASE,
)

# Speciality values that mark a facility as EXCLUSIVELY non-cardiac
# A facility is excluded only when its speciality tag is entirely within this set
_EXCLUDED_SPECIALTIES = {
    "ophthalmology", "eye", "dental", "dentistry", "maternity",
    "gynaecology", "gynecology", "obstetrics", "paediatrics", "pediatrics",
    "orthopaedics", "orthopedics", "psychiatry", "dermatology",
    "urology", "ent", "otolaryngology", "physiotherapy",
    "ayurveda", "homeopathy",
}

# Name fragments that clearly mark an unrelated single-specialty facility
_EXCLUDED_NAME_PATTERN = re.compile(
    r"\beye\b|eye.?hospital|eye.?care|eye.?clinic|optic|\bdental\b|dentist|"
    r"dental.?clinic|dental.?care|maternity|gynaecolog|gynecolog|"
    r"obstetric|paediatric|pediatric|orthopaedic|orthopedic|\bskin\b|"
    r"dermatolog|\burnt\b|urology|physiother|ayurveda|homoeopath|homeopath",
    re.IGNORECASE,
)


def _is_relevant(tags: dict) -> bool:
    """
    Return True for hospitals relevant to cardiac care.

    Logic (exclusion-based — keeps large multi-specialty hospitals):
    * If the facility has a speciality tag that is ENTIRELY excluded  → drop.
    * If the facility name clearly marks it as a non-cardiac specialty → drop.
    * Everything else is kept:
        - Cardiac-specific hospitals / clinics
        - Large multi-specialty hospitals (Apollo, Fortis, AIIMS, etc.)
        - General hospitals with no speciality tag
    """
    speciality = (
        tags.get("healthcare:speciality") or tags.get("speciality") or ""
    ).lower().strip()

    if speciality:
        parts = [p.strip() for p in re.split(r"[,;/]", speciality) if p.strip()]
        if parts and all(p in _EXCLUDED_SPECIALTIES for p in parts):
            return False

    name = (tags.get("name") or tags.get("name:en") or "").strip()
    if _EXCLUDED_NAME_PATTERN.search(name):
        return False

    return True


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/nearby")
async def get_nearby_hospitals(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius: int = Query(default=5000, ge=500, le=20000, description="Search radius in metres"),
    _user_id: str = Depends(get_current_user_id),
):
    """
    GET /hospitals/nearby?lat=XX.XX&lng=YY.YY&radius=5000
    Returns hospitals and multi-specialty medical centres relevant to cardiac care.
    Excludes unrelated single-specialty facilities (eye hospitals, dental clinics,
    maternity homes, etc.) but keeps large multi-specialty hospitals that have
    cardiology departments (Apollo, Fortis, AIIMS, etc.).
    """
    query = OVERPASS_QUERY_TEMPLATE.format(
        radius=radius, lat=lat, lng=lng
    )

    last_error: str = "Unknown error"
    data: dict | None = None

    async with httpx.AsyncClient(timeout=35.0) as client:
        for mirror_url in OVERPASS_MIRRORS:
            try:
                resp = await client.post(mirror_url, data={"data": query})

                # 429 = rate limited, 504 = mirror timeout — try next mirror
                if resp.status_code in (429, 502, 503, 504):
                    last_error = f"Mirror {mirror_url} returned {resp.status_code}"
                    await asyncio.sleep(0.5)
                    continue

                resp.raise_for_status()
                data = resp.json()
                break  # success

            except (httpx.RequestError, httpx.TimeoutException) as e:
                last_error = f"Mirror {mirror_url} unreachable: {e}"
                continue
            except httpx.HTTPStatusError as e:
                last_error = f"Mirror {mirror_url} HTTP {e.response.status_code}"
                continue

    if data is None:
        raise HTTPException(
            status_code=503,
            detail=f"All Overpass API mirrors failed. Last error: {last_error}",
        )

    hospitals = []
    seen_names: set[str] = set()

    for element in data.get("elements", []):
        tags = element.get("tags", {})

        # ── Relevance filter ────────────────────────────────────────────
        # Drop eye hospitals, dental clinics, maternity homes, etc.
        # Keep general hospitals, multi-specialty centres, and cardiac clinics.
        if not _is_relevant(tags):
            continue
        # ────────────────────────────────────────────────────────────────

        # Resolve coordinates (nodes have lat/lon directly; ways have a center)
        if element["type"] == "node":
            h_lat, h_lng = element.get("lat"), element.get("lon")
        else:
            center = element.get("center", {})
            h_lat, h_lng = center.get("lat"), center.get("lon")

        if h_lat is None or h_lng is None:
            continue

        name = tags.get("name") or tags.get("name:en") or "Unknown Hospital"

        # De-duplicate by name to avoid nearby nodes + way pairs
        key = name.lower().strip()
        if key in seen_names:
            continue
        seen_names.add(key)

        distance_km = _haversine_km(lat, lng, h_lat, h_lng)

        # Build address string from available tags
        addr_parts = []
        for field in ("addr:housenumber", "addr:street", "addr:suburb", "addr:city", "addr:state"):
            val = tags.get(field)
            if val:
                addr_parts.append(val)
        address = ", ".join(addr_parts) if addr_parts else tags.get("addr:full", "Address not available")

        hospitals.append({
            "name": name,
            "lat": h_lat,
            "lng": h_lng,
            "distance_km": round(distance_km, 2),
            "address": address,
            "phone": tags.get("phone") or tags.get("contact:phone"),
            "website": tags.get("website") or tags.get("contact:website"),
            "emergency": tags.get("emergency") == "yes",
            "specialty": (
                tags.get("healthcare:speciality")
                or tags.get("speciality")
                or ("Cardiology" if _CARDIAC_PATTERN.search(name) else "Multi-specialty")
            ),
            "maps_url": f"https://www.google.com/maps/dir/?api=1&destination={h_lat},{h_lng}",
        })

    # Sort by distance
    hospitals.sort(key=lambda h: h["distance_km"])

    return {
        "count": len(hospitals),
        "radius_km": radius / 1000,
        "user_location": {"lat": lat, "lng": lng},
        "hospitals": hospitals[:20],  # cap at 20 results
    }
