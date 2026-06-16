from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: str
    name: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}