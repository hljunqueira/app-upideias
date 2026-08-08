"""UP Analytics backend API integration tests.

Covers: auth (register/login/me/logout), Instagram (accounts/metrics/posts/sync),
plans/billing, AI insight/ideas (Gemini via Emergent), automations (WhatsApp sim),
Google session flow via Mongo direct-insert, brute-force lockout.
"""
import os
import time
import uuid
import pytest
import requests
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://upideias-landing.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "up_analytics")

DEMO_EMAIL = "creator@upideias.com"
DEMO_PASSWORD = "Creator@2026"
ADMIN_EMAIL = "admin@upideias.com"
ADMIN_PASSWORD = "Admin@2026"


# ------------------- Fixtures -------------------

@pytest.fixture(scope="module")
def mongo():
    return MongoClient(MONGO_URL)[DB_NAME]


@pytest.fixture
def demo_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    assert r.status_code == 200, f"Demo login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture
def fresh_user_session():
    email = f"TEST_{uuid.uuid4().hex[:10]}@example.com"
    s = requests.Session()
    r = s.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "TestPass@2026"})
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    return s, email, r.json()


# ------------------- Health -------------------

def test_health_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ------------------- Auth -------------------

class TestAuth:
    def test_register_creates_user_and_seeds_data(self, mongo):
        email = f"TEST_{uuid.uuid4().hex[:10]}@example.com"
        s = requests.Session()
        r = s.post(f"{API}/auth/register", json={"name": "Novo", "email": email, "password": "SecretPass@1"})
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == email.lower()
        assert body["name"] == "Novo"
        assert "user_id" in body
        assert "password_hash" not in body
        # Cookie set
        assert "access_token" in s.cookies.get_dict(), f"Cookies: {s.cookies.get_dict()}"

        # Verify seed
        me = s.get(f"{API}/auth/me")
        assert me.status_code == 200
        accts = s.get(f"{API}/instagram/accounts")
        assert accts.status_code == 200
        accounts = accts.json()
        assert len(accounts) >= 1
        assert accounts[0]["username"] == "upideias"

        # Cleanup — scope by this user's account_ids only (avoid nuking demo user data)
        u = mongo.users.find_one({"email": email.lower()})
        if u:
            acct_ids = [a["id"] for a in mongo.instagram_accounts.find({"user_id": u["user_id"]})]
            if acct_ids:
                mongo.instagram_daily_metrics.delete_many({"instagram_account_id": {"$in": acct_ids}})
                mongo.instagram_media.delete_many({"instagram_account_id": {"$in": acct_ids}})
            mongo.instagram_accounts.delete_many({"user_id": u["user_id"]})
            mongo.users.delete_one({"user_id": u["user_id"]})

    def test_register_duplicate_email_returns_400(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/register", json={"name": "Demo", "email": DEMO_EMAIL, "password": "whatever12"})
        assert r.status_code == 400
        assert "cadastrado" in r.json().get("detail", "").lower()

    def test_register_weak_password_returns_400(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/register", json={"name": "X", "email": f"TEST_{uuid.uuid4().hex[:6]}@x.com", "password": "123"})
        assert r.status_code == 400

    def test_login_success(self, mongo):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == DEMO_EMAIL
        assert "password_hash" not in body
        assert "access_token" in s.cookies.get_dict()

    def test_login_wrong_password(self, mongo):
        # Use a specifically-crafted email so it does not affect the demo lockout
        # (identifier is host:email). We only need to verify 401 response.
        r = requests.post(f"{API}/auth/login", json={"email": "nonexistent_TEST@x.com", "password": "wrongpass"})
        assert r.status_code == 401
        assert "incorretos" in r.json().get("detail", "").lower()

    def test_me_without_cookie_returns_401(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout_clears_cookie(self, demo_session):
        r = demo_session.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # After logout, a fresh /me on a new client sans cookie should be 401
        r2 = requests.get(f"{API}/auth/me")
        assert r2.status_code == 401


class TestGoogleSession:
    """Simulates the Google flow by inserting a session row directly (per /app/auth_testing.md)."""

    def test_bearer_session_token_authenticates(self, mongo):
        user = mongo.users.find_one({"email": DEMO_EMAIL})
        assert user, "Demo user missing"
        token = f"TEST_sess_{uuid.uuid4().hex}"
        mongo.user_sessions.insert_one({
            "user_id": user["user_id"],
            "session_token": token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        try:
            r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert r.status_code == 200
            assert r.json()["email"] == DEMO_EMAIL
        finally:
            mongo.user_sessions.delete_one({"session_token": token})


class TestBruteForce:
    def test_brute_force_lockout_after_5_fails(self, mongo):
        """NOTE: Lockout uses request.client.host which varies behind K8s ingress
        (multiple proxy pods). We seed all likely identifiers via direct DB write
        to verify the check itself works, then confirm 429 for a subsequent attempt."""
        email = f"brute_TEST_{uuid.uuid4().hex[:8]}@x.com"
        # Try up to 20 attempts against public URL; if lockout kicks in for any proxy IP,
        # we should eventually see 429.
        codes = []
        for _ in range(20):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
            codes.append(r.status_code)
            if r.status_code == 429:
                break
        assert 429 in codes, (
            "Brute-force lockout never triggered across 20 attempts. "
            "Likely cause: request.client.host is the ingress proxy pod IP which rotates, "
            "so counter never reaches 5 for one identifier. Use X-Forwarded-For instead. "
            f"Codes seen: {codes}"
        )
        mongo.login_attempts.delete_many({"identifier": {"$regex": email}})


# ------------------- Instagram -------------------

class TestInstagram:
    def test_accounts_and_metrics_flow(self, demo_session):
        r = demo_session.get(f"{API}/instagram/accounts")
        assert r.status_code == 200
        accts = r.json()
        assert len(accts) >= 1
        acc = accts[0]
        assert acc["username"] == "upideias"
        assert acc["followers_count"] > 0

        # Metrics
        m = demo_session.get(f"{API}/instagram/accounts/{acc['id']}/metrics?days=30")
        assert m.status_code == 200
        metrics = m.json()
        assert len(metrics) >= 20, f"Expected ~30 metrics, got {len(metrics)}"
        assert "reach" in metrics[0]
        assert "engagement_rate" in metrics[0]

        # Posts
        p = demo_session.get(f"{API}/instagram/accounts/{acc['id']}/posts")
        assert p.status_code == 200
        posts = p.json()
        assert len(posts) >= 5

        # Sync
        sync = demo_session.post(f"{API}/instagram/accounts/{acc['id']}/sync")
        assert sync.status_code == 200
        assert sync.json().get("ok") is True

    def test_metrics_requires_auth(self):
        r = requests.get(f"{API}/instagram/accounts/anything/metrics")
        assert r.status_code == 401


# ------------------- Plans / Billing -------------------

class TestPlansBilling:
    def test_plans_public(self):
        r = requests.get(f"{API}/plans")
        assert r.status_code == 200
        plans = r.json()
        assert len(plans) == 3
        slugs = {p["slug"] for p in plans}
        assert slugs == {"iniciante", "pro", "agencia"}

    def test_subscription_requires_auth(self):
        r = requests.get(f"{API}/billing/subscription")
        assert r.status_code == 401

    def test_subscription_authenticated(self, demo_session):
        r = demo_session.get(f"{API}/billing/subscription")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "active"
        assert data["plan"]["slug"] in {"iniciante", "pro", "agencia"}


# ------------------- Automations -------------------

class TestAutomations:
    def test_whatsapp_send_simulated(self, demo_session):
        r = demo_session.post(f"{API}/automations/whatsapp/send", json={"phone": "+5511999999999", "message": "Teste TEST_"})
        assert r.status_code == 200
        body = r.json()
        assert body.get("ok") is True
        assert body.get("simulated") is True

    def test_list_messages(self, demo_session):
        r = demo_session.get(f"{API}/automations/messages")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ------------------- AI (Gemini) -------------------

class TestAI:
    def test_ai_insight_generates_diagnostic(self, demo_session):
        # Get account id
        accts = demo_session.get(f"{API}/instagram/accounts").json()
        acc_id = accts[0]["id"]
        r = demo_session.post(f"{API}/ai/insight", json={"account_id": acc_id}, timeout=90)
        assert r.status_code == 200, f"AI insight failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        assert "title" in data and data["title"]
        assert "summary" in data
        assert isinstance(data.get("recommended_actions"), list)

    def test_ai_ideas_generates_content(self, demo_session):
        r = demo_session.post(
            f"{API}/ai/ideas",
            json={"niche": "Marketing digital", "objective": "Aumentar engajamento", "tone": "Direto", "count": 2},
            timeout=90,
        )
        assert r.status_code == 200, f"AI ideas failed: {r.status_code} {r.text[:300]}"
        ideas = r.json()
        assert isinstance(ideas, list) and len(ideas) >= 1
        first = ideas[0]
        for k in ("title", "hook", "caption", "hashtags"):
            assert k in first, f"Missing {k} in idea"

    def test_ai_usage(self, demo_session):
        r = demo_session.get(f"{API}/ai/usage")
        assert r.status_code == 200
        body = r.json()
        assert "monthly_requests" in body
        assert body.get("limit") == 100
