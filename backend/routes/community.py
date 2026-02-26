"""
Community forum routes — posts, comments, likes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from bson import ObjectId
from database import get_db
from middleware.clerk_auth import get_current_user_id
from models.community import PostCreate, CommentCreate

router = APIRouter(prefix="/community", tags=["Community"])


def serialize_post(doc: dict) -> dict:
    """Convert MongoDB doc to JSON-safe dict."""
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    doc["likes"] = len(doc.get("likes", []))
    # Serialize comment ids
    for c in doc.get("comments", []):
        if "_id" in c:
            c["id"] = str(c["_id"])
            del c["_id"]
    return doc


async def _get_user_info(db, user_id: str) -> tuple:
    """Fetch user name and image from the users collection."""
    user = await db.users.find_one({"clerk_id": user_id})
    if user:
        name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Anonymous"
        image = user.get("image_url", "")
    else:
        name = "Anonymous"
        image = ""
    return name, image


@router.post("", status_code=201)
async def create_post(
    data: PostCreate,
    user_id: str = Depends(get_current_user_id),
):
    """POST /community — create a new forum post."""
    db = get_db()
    user_name, user_image = await _get_user_info(db, user_id)

    doc = {
        "user_id": user_id,
        "user_name": user_name,
        "user_image": user_image,
        "title": data.title,
        "content": data.content,
        "image_url": data.image_url,
        "tags": data.tags or [],
        "comments": [],
        "likes": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.posts.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    del doc["_id"]
    doc["likes"] = 0
    return doc


@router.get("")
async def list_posts(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
):
    """GET /community — list forum posts (paginated)."""
    db = get_db()
    cursor = db.posts.find().sort("created_at", -1).skip(skip).limit(limit)
    posts = []
    async for doc in cursor:
        posts.append(serialize_post(doc))
    return posts


@router.get("/{post_id}")
async def get_post(post_id: str):
    """GET /community/{id} — get a single post with comments."""
    db = get_db()
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    doc = await db.posts.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")

    return serialize_post(doc)


@router.post("/{post_id}/comment", status_code=201)
async def add_comment(
    post_id: str,
    data: CommentCreate,
    user_id: str = Depends(get_current_user_id),
):
    """POST /community/{id}/comment — add a comment to a post."""
    db = get_db()
    user_name, user_image = await _get_user_info(db, user_id)

    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    comment = {
        "_id": ObjectId(),
        "user_id": user_id,
        "user_name": user_name,
        "user_image": user_image,
        "content": data.content,
        "created_at": datetime.utcnow(),
    }

    result = await db.posts.update_one(
        {"_id": oid},
        {"$push": {"comments": comment}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    comment["id"] = str(comment["_id"])
    del comment["_id"]
    return comment


@router.post("/{post_id}/like")
async def toggle_like(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """POST /community/{id}/like — toggle like on a post."""
    db = get_db()
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    post = await db.posts.find_one({"_id": oid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    likes = post.get("likes", [])
    if user_id in likes:
        # Unlike
        await db.posts.update_one({"_id": oid}, {"$pull": {"likes": user_id}})
        return {"liked": False, "total_likes": len(likes) - 1}
    else:
        # Like
        await db.posts.update_one({"_id": oid}, {"$push": {"likes": user_id}})
        return {"liked": True, "total_likes": len(likes) + 1}


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """DELETE /community/{id} — delete own post."""
    db = get_db()
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    result = await db.posts.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found or not authorized")

    return {"message": "Post deleted"}
