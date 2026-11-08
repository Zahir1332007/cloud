import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify health endpoint responds with 200 OK for AWS ALB."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert data["service"] == "CloudStore API"


def test_root_endpoint():
    """Verify root endpoint redirect info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "/docs" in data["docs"]


def test_list_products():
    """Verify public product catalog listing."""
    response = client.get("/api/v1/products?size=5")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) <= 5


def test_list_categories():
    """Verify categories endpoint returns populated categories."""
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) > 0


def test_login_admin():
    """Verify admin login with seed credentials."""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@cloudstore.com",
        "password": "Admin123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"


def test_login_invalid_credentials():
    """Verify 401 unauthorized on incorrect password."""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@cloudstore.com",
        "password": "WrongPassword999!"
    })
    assert response.status_code == 401

