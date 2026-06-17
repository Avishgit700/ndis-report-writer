import pytest

BASE_URL = "http://localhost:3000"
TEST_EMAIL = "test@notescribe.ai"
TEST_PASSWORD = "Password123!"

@pytest.fixture(scope="session")
def auth_token():
    """Login once, share token across all tests."""
    import requests
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["data"]["accessToken"]
    return token

@pytest.fixture(scope="session")
def headers(auth_token):
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}",
    }
