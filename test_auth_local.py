
import sys
import os

# Mock Environment vars BEFORE importing app
os.environ["DATABASE_URL"] = "sqlite:///./test_auth.db"
os.environ["SECRET_KEY"] = "supersecret"

from fastapi.testclient import TestClient
from server.main import app
from server.app.database import Base, engine

# Create Test DB
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_auth_flow():
    print("1. Testing Registration...")
    reg_payload = {
        "email": "test@example.com",
        "password": "strongpassword123",
        "full_name": "Test User"
    }
    response = client.post("/auth/register", json=reg_payload)
    if response.status_code != 200:
        print(f"FAILED: {response.text}")
        sys.exit(1)
    data = response.json()
    print(f"SUCCESS: User Created (ID: {data['id']})")

    print("\n2. Testing Login...")
    login_payload = {
        "username": "test@example.com",
        "password": "strongpassword123"
    }
    response = client.post("/auth/login", data=login_payload)
    if response.status_code != 200:
        print(f"FAILED: {response.text}")
        sys.exit(1)
    token = response.json()["access_token"]
    print(f"SUCCESS: Got JWT Token ({token[:20]}...)")

    print("\n3. Testing Protected Route (/auth/me)...")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: {response.text}")
        sys.exit(1)
    user = response.json()
    print(f"SUCCESS: Hello {user['full_name']}")
    
    print("\n✅ AUTHENTICATION LOGIC IS PERFECT!")

if __name__ == "__main__":
    test_auth_flow()
