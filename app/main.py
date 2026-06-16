from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.database import engine, Base, check_db_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: créer les tables si elles n'existent pas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: fermer l'engine
    await engine.dispose()


app = FastAPI(
    title="InfraStack",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
def root():
    return {
        "message": "InfraStack API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/db-check")
async def db_check():
    result = await check_db_connection()
    return result