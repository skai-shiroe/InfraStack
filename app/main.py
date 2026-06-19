from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from app.core.database import engine, Base, check_db_connection
from app.api import users
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST


REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)
REQUEST_DURATION = Gauge(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["endpoint"],
)


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


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


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

app.include_router(users.router)