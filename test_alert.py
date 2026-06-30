import sys
import os
from unittest.mock import MagicMock, patch

# ── Inject a fake 'database' module so accidents.py never reads .env ──────────
mock_supabase_client = MagicMock()
mock_db_module = MagicMock()
mock_db_module.supabase = mock_supabase_client
sys.modules["database"] = mock_db_module

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from fastapi import FastAPI
from fastapi.testclient import TestClient
import backend.routes.accidents as accidents_module

app = FastAPI()
app.include_router(accidents_module.router)

PASSED = 0
FAILED = 0

def assert_eq(label, got, expected):
    global PASSED, FAILED
    if got == expected:
        print(f"  PASS  {label}: {got}")
        PASSED += 1
    else:
        print(f"  FAIL  {label}: expected {expected!r}, got {got!r}")
        FAILED += 1


def make_mock_supabase(select_side_effects=None, update_returns=None):
    """
    Build a fresh supabase mock each time.
    select_side_effects: list of MagicMock objects returned one-by-one for .select().eq().execute()
    update_returns: what .update().eq().execute() returns
    """
    sb = MagicMock()

    # We need separate mock objects for each table call to avoid chaining conflicts.
    select_exec = MagicMock()
    if select_side_effects:
        select_exec.side_effect = select_side_effects
    
    update_exec = MagicMock()
    if update_returns:
        update_exec.return_value = update_returns

    def table_handler(table_name):
        tbl = MagicMock()
        tbl.select.return_value.eq.return_value.execute = select_exec
        tbl.update.return_value.eq.return_value.execute = update_exec
        return tbl

    sb.table.side_effect = table_handler
    return sb, select_exec, update_exec


# ─────────────────────────────────────────────────────────────────────────────
# Test 1 : 404 when accident not found
# ─────────────────────────────────────────────────────────────────────────────
print("\n[TEST 1] 404 when accident_id does not exist")
sb, _, _ = make_mock_supabase(
    select_side_effects=[MagicMock(data=[])]
)
accidents_module.supabase = sb
client = TestClient(app, raise_server_exceptions=False)

r = client.post("/send-alert", json={"accident_id": 999})
assert_eq("status_code", r.status_code, 404)
assert_eq("detail",      r.json().get("detail"), "Accident not found")


# ─────────────────────────────────────────────────────────────────────────────
# Test 2 : 409 when alert already DISPATCHED  (first-call duplicate scenario)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[TEST 2] 409 when alert already DISPATCHED")
sb, _, _ = make_mock_supabase(
    select_side_effects=[MagicMock(data=[{
        "id": 123, "plate": "KA-01-AB-1234", "camera_id": "cam-01",
        "alert_status": "DISPATCHED"
    }])]
)
accidents_module.supabase = sb
client = TestClient(app, raise_server_exceptions=False)

r = client.post("/send-alert", json={"accident_id": 123})
assert_eq("status_code", r.status_code, 409)
assert_eq("detail",      r.json().get("detail"), "Alert already dispatched for this accident.")


# ─────────────────────────────────────────────────────────────────────────────
# Test 3 : 200 on first dispatch AND the DB update is invoked
# ─────────────────────────────────────────────────────────────────────────────
print("\n[TEST 3] 200 on first dispatch; DB update must be called")
sb, _, update_exec = make_mock_supabase(
    select_side_effects=[
        MagicMock(data=[{"id": 123, "plate": "KA-01-AB-1234", "camera_id": "cam-01", "alert_status": None}]),
        MagicMock(data=[{"plate": "KA-01-AB-1234", "owner_phone": "9876543210", "emergency_contact": "9000000000"}]),
        MagicMock(data=[{"camera_id": "cam-01", "area_name": "MG Road"}]),
    ],
    update_returns=MagicMock(data=[{"id": 123}])
)
accidents_module.supabase = sb
client = TestClient(app, raise_server_exceptions=False)

r = client.post("/send-alert", json={"accident_id": 123})
assert_eq("status_code",  r.status_code, 200)
body = r.json()
assert_eq("status field", body.get("status"), "DISPATCHED")
assert_eq("accident_id",  body.get("accident_id"), 123)
assert_eq("DB update called", update_exec.called, True)


# ─────────────────────────────────────────────────────────────────────────────
# Test 4 : Duplicate call → 409 with NO second DB update
# ─────────────────────────────────────────────────────────────────────────────
print("\n[TEST 4] Duplicate call returns 409; DB update must NOT be called")
sb, _, update_exec = make_mock_supabase(
    select_side_effects=[MagicMock(data=[{
        "id": 123, "plate": "KA-01-AB-1234", "camera_id": "cam-01",
        "alert_status": "DISPATCHED"
    }])]
)
accidents_module.supabase = sb
client = TestClient(app, raise_server_exceptions=False)

r = client.post("/send-alert", json={"accident_id": 123})
assert_eq("status_code",         r.status_code, 409)
assert_eq("detail",              r.json().get("detail"), "Alert already dispatched for this accident.")
assert_eq("DB update NOT called", update_exec.called, False)


# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{'='*52}")
print(f"Results:  {PASSED} passed  |  {FAILED} failed")
if FAILED == 0:
    print("ALL TESTS PASSED -- duplicate dispatch bug is FIXED!")
else:
    print("SOME TESTS FAILED -- review output above.")
print('='*52)
sys.exit(0 if FAILED == 0 else 1)
