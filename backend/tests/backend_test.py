"""
Backend regression tests for Laksono Kontraktor API.
Covers: Public endpoints, Auth (login/me/logout), Admin CRUD, Inquiries.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://field-konstruksi.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@laksonokontraktor.com"
ADMIN_PASSWORD = "LaksonoAdmin2025"


# ============================================================
# Fixtures
# ============================================================
@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_token(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ============================================================
# Public Endpoints
# ============================================================
class TestPublic:
    def test_root(self, client):
        r = client.get(f"{API}/", timeout=30)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_stats(self, client):
        r = client.get(f"{API}/stats", timeout=30)
        assert r.status_code == 200
        d = r.json()
        for k in ("projects", "cities", "team", "years"):
            assert k in d
            assert isinstance(d[k], int)

    def test_services_seeded(self, client):
        r = client.get(f"{API}/services", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 8
        slugs = {s["slug"] for s in data}
        # confirm key sport slugs exist
        for must in ("mini-soccer", "futsal", "basketball", "tennis", "running-track"):
            assert must in slugs

    def test_service_by_slug(self, client):
        r = client.get(f"{API}/services/mini-soccer", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "mini-soccer"
        assert "FIFA" in " ".join(d.get("features", []) + [d.get("full_desc", "")])

    def test_projects_list(self, client):
        r = client.get(f"{API}/projects", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4
        # _id must not leak
        assert all("_id" not in p for p in data)

    def test_projects_filter(self, client):
        r = client.get(f"{API}/projects?category=basketball", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert all(p["category"] == "basketball" for p in data)

    def test_project_by_id(self, client):
        all_p = client.get(f"{API}/projects", timeout=30).json()
        pid = all_p[0]["id"]
        r = client.get(f"{API}/projects/{pid}", timeout=30)
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_project_not_found(self, client):
        r = client.get(f"{API}/projects/nonexistent-id-xyz", timeout=30)
        assert r.status_code == 404

    def test_blog_list(self, client):
        r = client.get(f"{API}/blog", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_blog_by_slug(self, client):
        posts = client.get(f"{API}/blog", timeout=30).json()
        slug = posts[0]["slug"]
        r = client.get(f"{API}/blog/{slug}", timeout=30)
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_testimonials(self, client):
        r = client.get(f"{API}/testimonials", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 1

    def test_settings(self, client):
        r = client.get(f"{API}/settings", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "company_name" in d and "whatsapp" in d


# ============================================================
# Inquiries Public Create
# ============================================================
class TestInquiriesPublic:
    def test_create_inquiry_no_auth(self, client):
        payload = {
            "name": "TEST_Lead",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+628123456789",
            "service_type": "mini-soccer",
            "message": "TEST inquiry from automated tests",
        }
        r = client.post(f"{API}/inquiries", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == "TEST_Lead"
        assert d["status"] == "new"
        assert "id" in d


# ============================================================
# Auth
# ============================================================
class TestAuth:
    def test_login_success(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and len(d["token"]) > 20
        assert d["user"]["email"] == ADMIN_EMAIL
        assert d["user"]["role"] == "admin"
        # Cookie set
        assert "access_token" in r.cookies

    def test_login_invalid(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=30)
        assert r.status_code == 401

    def test_me_with_bearer(self, client, auth_token):
        r = client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {auth_token}"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_no_auth(self, client):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_protected_rejects_no_auth(self, client):
        r = requests.post(f"{API}/projects", json={}, timeout=30)
        assert r.status_code == 401

    def test_logout(self, client, auth_token):
        r = client.post(f"{API}/auth/logout", headers={"Authorization": f"Bearer {auth_token}"}, timeout=30)
        assert r.status_code == 200


# ============================================================
# Admin Overview
# ============================================================
class TestAdminOverview:
    def test_overview(self, client, auth_headers):
        r = client.get(f"{API}/admin/overview", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "totals" in d
        assert "monthly_inquiries" in d
        assert "by_service_type" in d
        for k in ("projects", "inquiries", "new_inquiries", "blog_posts", "services"):
            assert k in d["totals"]


# ============================================================
# Admin CRUD - Projects
# ============================================================
class TestProjectsCRUD:
    created_id = None

    def test_create(self, client, auth_headers):
        payload = {
            "title": "TEST_Project_E2E",
            "category": "basketball",
            "location": "TEST City",
            "surface_type": "Test Surface",
            "area_size": "100 m²",
            "completion_year": 2025,
            "description": "Test project",
            "cover_image": "https://example.com/img.jpg",
        }
        r = client.post(f"{API}/projects", json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == "TEST_Project_E2E"
        TestProjectsCRUD.created_id = d["id"]

    def test_update(self, client, auth_headers):
        assert TestProjectsCRUD.created_id
        payload = {
            "title": "TEST_Project_Updated",
            "category": "basketball",
            "location": "TEST City",
            "surface_type": "Test Surface",
            "area_size": "100 m²",
            "completion_year": 2025,
            "description": "Updated",
            "cover_image": "https://example.com/img.jpg",
        }
        r = client.put(f"{API}/projects/{TestProjectsCRUD.created_id}", json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Project_Updated"

        # verify persistence
        g = client.get(f"{API}/projects/{TestProjectsCRUD.created_id}", timeout=30)
        assert g.json()["title"] == "TEST_Project_Updated"

    def test_delete(self, client, auth_headers):
        assert TestProjectsCRUD.created_id
        r = client.delete(f"{API}/projects/{TestProjectsCRUD.created_id}", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        g = client.get(f"{API}/projects/{TestProjectsCRUD.created_id}", timeout=30)
        assert g.status_code == 404


# ============================================================
# Admin CRUD - Blog
# ============================================================
class TestBlogCRUD:
    created_id = None

    def test_create(self, client, auth_headers):
        slug = f"test-blog-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "title": "TEST_Blog",
            "excerpt": "exc",
            "content": "content",
            "cover_image": "https://example.com/i.jpg",
            "category": "Test",
        }
        r = client.post(f"{API}/blog", json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        TestBlogCRUD.created_id = r.json()["id"]

    def test_delete(self, client, auth_headers):
        if TestBlogCRUD.created_id:
            r = client.delete(f"{API}/blog/{TestBlogCRUD.created_id}", headers=auth_headers, timeout=30)
            assert r.status_code == 200


# ============================================================
# Admin Inquiries Management
# ============================================================
class TestInquiriesAdmin:
    inquiry_id = None

    def test_create_seed_inquiry(self, client):
        r = client.post(f"{API}/inquiries", json={
            "name": "TEST_Inq",
            "email": "test_inq@example.com",
            "phone": "+62800",
            "service_type": "futsal",
            "message": "test"
        }, timeout=30)
        assert r.status_code == 200
        TestInquiriesAdmin.inquiry_id = r.json()["id"]

    def test_list_requires_auth(self, client):
        r = requests.get(f"{API}/inquiries", timeout=30)
        assert r.status_code == 401

    def test_list_with_auth(self, client, auth_headers):
        r = client.get(f"{API}/inquiries", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_patch_status(self, client, auth_headers):
        assert TestInquiriesAdmin.inquiry_id
        r = client.patch(f"{API}/inquiries/{TestInquiriesAdmin.inquiry_id}",
                         json={"status": "contacted", "notes": "TEST note"},
                         headers=auth_headers, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "contacted"
        assert d["notes"] == "TEST note"

    def test_delete_cleanup(self, client, auth_headers):
        if TestInquiriesAdmin.inquiry_id:
            client.delete(f"{API}/inquiries/{TestInquiriesAdmin.inquiry_id}", headers=auth_headers, timeout=30)


# ============================================================
# Settings Update
# ============================================================
class TestSettings:
    def test_update_settings(self, client, auth_headers):
        # Read current settings
        r = client.get(f"{API}/settings", timeout=30)
        assert r.status_code == 200
        cur = r.json()
        cur.pop("id", None)
        cur["tagline"] = "TEST_Tagline"
        r2 = client.put(f"{API}/settings", json=cur, headers=auth_headers, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["tagline"] == "TEST_Tagline"
