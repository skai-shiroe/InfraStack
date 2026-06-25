import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "secret123"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    # Premier enregistrement
    await client.post("/auth/register", json={
        "name": "User 1", "email": "dup@example.com", "password": "secret123"
    })
    # Deuxième avec le même email
    response = await client.post("/auth/register", json={
        "name": "User 2", "email": "dup@example.com", "password": "secret456"
    })
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login_success(client):
    # Créer un utilisateur d'abord
    await client.post("/auth/register", json={
        "name": "Login User", "email": "login@example.com", "password": "secret123"
    })
    # Tenter le login
    response = await client.post("/auth/login", json={
        "email": "login@example.com", "password": "secret123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/auth/register", json={
        "name": "User", "email": "wrong@example.com", "password": "secret123"
    })
    response = await client.post("/auth/login", json={
        "email": "wrong@example.com", "password": "wrongpass"
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_current_user(client):
    # Register + login
    register_res = await client.post("/auth/register", json={
        "name": "Current User", "email": "current@example.com", "password": "secret123"
    })
    token = register_res.json()["access_token"]
    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "current@example.com"

@pytest.mark.asyncio
async def test_get_current_user_no_token(client):
    response = await client.get("/auth/me")
    assert response.status_code == 401