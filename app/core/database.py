import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:skai@localhost:5432/infrastack"
)

engine = create_async_engine(DATABASE_URL, echo=True)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def check_db_connection():
    """Teste la connexion à PostgreSQL et retourne un état."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT current_database()"))
            db_name = result.scalar()
            return {"status": "connected", "database": db_name}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
