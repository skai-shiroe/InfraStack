from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.database import engine, Base, check_db_connection
from app.api import users
from prometheus_client import Counter, Histogram, generate_latest, REGISTRY, make_asgi_app
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import asyncio

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

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        method = request.method
        path = request.url.path
        # On évite de mesurer le endpoint /metrics lui-même pour ne pas boucler
        if path == "/metrics":
            return await call_next(request)
        start_time = time.time()
        try:
            response = await call_next(request)
            status = response.status_code
            REQUEST_COUNT.labels(method=method, endpoint=path, status=status).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=path).observe(time.time() - start_time)
            return response
        except Exception as e:
            # En cas d'exception, on compte comme 500
            REQUEST_COUNT.labels(method=method, endpoint=path, status=500).inc()
            raise e

app.add_middleware(PrometheusMiddleware)

# Endpoint /metrics pour que Prometheus puisse scraper
@app.get("/metrics")
async def metrics():
    return Response(generate_latest(REGISTRY), media_type="text/plain")

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
