"""
User model — stored after Clerk authentication, holds profile data.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    clerk_id: str
    email: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    image_url: Optional[str] = ""


class UserProfile(BaseModel):
    clerk_id: str
    email: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    image_url: Optional[str] = ""
    age: Optional[int] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None  # E.164 e.g. +91XXXXXXXXXX
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserResponse(BaseModel):
    id: str
    clerk_id: str
    email: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    image_url: Optional[str] = ""
    age: Optional[int] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    created_at: datetime
