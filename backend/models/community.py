"""
Community forum models — posts, comments, and images.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_image: Optional[str] = ""
    content: str
    created_at: datetime


class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    content: str = Field(..., min_length=1, max_length=10000)
    image_url: Optional[str] = None
    tags: Optional[List[str]] = []


class PostResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_image: Optional[str] = ""
    title: str
    content: str
    image_url: Optional[str] = None
    tags: List[str] = []
    comments: List[CommentResponse] = []
    likes: int = 0
    created_at: datetime


class PostRecord(BaseModel):
    """Stored in MongoDB."""
    user_id: str
    user_name: str
    user_image: str = ""
    title: str
    content: str
    image_url: Optional[str] = None
    tags: List[str] = []
    comments: List[dict] = []
    likes: List[str] = []  # list of user_ids who liked
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
