from fastapi import FastAPI

app = FastAPI(
    title="InfraStack",
    version="1.0.0"
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