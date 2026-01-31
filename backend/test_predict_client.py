import requests

BASE = "http://localhost:8000"
LOGIN = f"{BASE}/auth/login"
PREDICT = f"{BASE}/predict"
IMAGE = r"C:\EmbryoAnalyser\test\0\D3_081_37d5f13606784d7cad4c237a9e07a273.jpg"

# 1) login (embryologist)
r = requests.post(LOGIN, json={"username":"embryologist","password":"embryo123"})
print("LOGIN", r.status_code, r.text)
if r.status_code != 200:
    raise SystemExit("Login failed")

token = r.json().get("access_token")
print("TOKEN:", token[:40] + "..." if token else None)

# 2) predict (send token)
with open(IMAGE,"rb") as f:
    files = {"file": f}
    data = {"prediction_data": '{"patient_audit_code":"P001","cycle_id":"C1","embryo_id":"E1"}'}
    headers = {"Authorization": f"Bearer {token}"}
    r2 = requests.post(PREDICT, files=files, data=data, headers=headers)
    print("PREDICT", r2.status_code, r2.text)