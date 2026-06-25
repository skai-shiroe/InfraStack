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
        "name": "Sales Test", "email": "sales@example.com", "password": "secret123"
    })
    res = await client.post("/auth/login", json={
        "email": "sales@example.com", "password": "secret123"
    })
    return res.json()["access_token"]

@pytest.mark.asyncio
async def test_create_sale(client, auth_token):
    # Créer un produit
    prod_res = await client.post("/stock/products", json={
        "name": "Salable", "quantity": 100, "unit": "pcs", "price": 25.0
    }, headers={"Authorization": f"Bearer {auth_token}"})
    product_id = prod_res.json()["id"]
    
    # Créer une vente
    response = await client.post("/stock/sales", json={
        "items": [{"product_id": product_id, "quantity": 2, "unit_price": 25.0}],
        "payment_method": "cash",
        "notes": "Test sale"
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["total"] == 50.0
    assert len(data["items"]) == 1

@pytest.mark.asyncio
async def test_sale_insufficient_stock(client, auth_token):
    prod_res = await client.post("/stock/products", json={
        "name": "Limited", "quantity": 1, "unit": "pcs", "price": 100.0
    }, headers={"Authorization": f"Bearer {auth_token}"})
    product_id = prod_res.json()["id"]
    
    response = await client.post("/stock/sales", json={
        "items": [{"product_id": product_id, "quantity": 10, "unit_price": 100.0}],
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_list_sales(client, auth_token):
    response = await client.get("/stock/sales", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)