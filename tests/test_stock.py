import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_token(client):
    await client.post("/auth/register", json={
        "name": "Stock Test", "email": "stock@example.com", "password": "secret123"
    })
    login_res = await client.post("/auth/login", json={
        "email": "stock@example.com", "password": "secret123"
    })
    return login_res.json()["access_token"]

@pytest.mark.asyncio
async def test_create_product(client, auth_token):
    response = await client.post("/stock/products", json={
        "name": "Test Product",
        "description": "A test product",
        "quantity": 100,
        "unit": "pcs",
        "price": 29.99
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"
    assert data["quantity"] == 100

@pytest.mark.asyncio
async def test_list_products(client, auth_token):
    # Créer 3 produits
    for i in range(3):
        await client.post("/stock/products", json={
            "name": f"Product {i}",
            "quantity": 10,
            "unit": "pcs",
            "price": 10.0
        }, headers={"Authorization": f"Bearer {auth_token}"})
    response = await client.get("/stock/products", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 3

@pytest.mark.asyncio
async def test_create_product_no_auth(client):
    response = await client.post("/stock/products", json={
        "name": "No Auth", "quantity": 1, "unit": "pcs", "price": 1.0
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_category(client, auth_token):
    response = await client.post("/stock/categories", json={
        "name": "Electronics",
        "description": "Electronic devices"
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    assert response.json()["name"] == "Electronics"

@pytest.mark.asyncio
async def test_stock_movement(client, auth_token):
    # Créer un produit
    prod_res = await client.post("/stock/products", json={
        "name": "Movable", "quantity": 50, "unit": "pcs", "price": 15.0
    }, headers={"Authorization": f"Bearer {auth_token}"})
    product_id = prod_res.json()["id"]
    
    # Entrée de stock
    response = await client.post("/stock/movements", json={
        "product_id": product_id,
        "movement_type": "entry",
        "quantity": 25,
        "reason": "Restock"
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    
    # Vérifier que le stock a augmenté
    product_res = await client.get(f"/stock/products/{product_id}", headers={"Authorization": f"Bearer {auth_token}"})
    assert product_res.json()["quantity"] == 75

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"