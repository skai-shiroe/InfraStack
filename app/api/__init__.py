from fastapi import APIRouter
from app.api import auth, users, dashboard

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(dashboard.router)

__all__ = ["api_router"]