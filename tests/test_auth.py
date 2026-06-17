"""
Auth API tests — login, register, forgot password.
"""
import requests
import pytest

BASE_URL = "http://localhost:3000"


def test_login_success():
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@notescribe.ai",
        "password": "Password123!",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "accessToken" in data["data"]
    assert "user" in data["data"]


def test_login_wrong_password():
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@notescribe.ai",
        "password": "wrongpassword",
    })
    assert res.status_code in (401, 400)
    assert res.json()["success"] is False


def test_login_missing_email():
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"password": "Password123!"})
    assert res.status_code in (400, 422)


def test_register_duplicate_email():
    res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Duplicate User",
        "email": "test@notescribe.ai",
        "password": "Password123!",
    })
    assert res.status_code in (400, 409)
    assert res.json()["success"] is False


def test_forgot_password_sends():
    res = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
        "email": "test@notescribe.ai",
    })
    assert res.status_code == 200
    assert res.json()["success"] is True


def test_forgot_password_unknown_email():
    # Should return 200 (don't reveal if email exists)
    res = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
        "email": "doesnotexist999@example.com",
    })
    assert res.status_code == 200
