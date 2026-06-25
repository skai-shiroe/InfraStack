from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas import DashboardStats
from app.models import User, Product, StockMovement, Sale
from sqlalchemy import select, func

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total users
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar() or 0
    last_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_registrations = (await db.execute(select(func.count(User.id)).where(User.created_at >= last_24h))).scalar() or 0

    # Products
    total_products = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    total_stock = (await db.execute(select(func.sum(Product.quantity)))).scalar() or 0

    # Sales
    total_sales = (await db.execute(select(func.count(Sale.id)))).scalar() or 0

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        recent_registrations=recent_registrations,
        total_products=total_products,
        total_stock=total_stock,
        total_sales=total_sales,
    )
