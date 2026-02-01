import requests
import json

print("Testing backend server...")
print("-" * 50)

try:
    # Test root endpoint
    print("\n1. Testing root endpoint (/)...")
    response = requests.get("http://localhost:8000/", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"   Error: {e}")

try:
    # Test health endpoint
    print("\n2. Testing health endpoint (/health)...")
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"   Error: {e}")

try:
    # Test login endpoint
    print("\n3. Testing login endpoint (/auth/login)...")
    response = requests.post(
        "http://localhost:8000/auth/login",
        json={"username": "admin", "password": "admin123"},
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.ok:
        print(f"   Login successful! Token: {response.json()['access_token'][:50]}...")
    else:
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "-" * 50)
print("Test complete!")
