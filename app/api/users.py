from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import UserCreate, UserUpdate, UserResponse
from app.services import users as users_service
from app.tasks.arq_pool import get_arq_pool

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await users_service.create_user(db, data)
    return user


@router.get("/", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    users = await users_service.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await users_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    user = await users_service.update_user(db, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await users_service.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return None


@router.post("/{user_id}/notify")
async def notify_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await users_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    pool = await get_arq_pool()
    job = await pool.enqueue_job(
        "send_email",
        user_id=user.id,
        email=user.email,
        subject="Welcome to InfraStack!",
    )

    return {
        "task_id": job.job_id,
        "status": "queued",
        "user_id": user.id,
        "email": user.email,
    }
