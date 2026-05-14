from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ============================================================
# DB SETUP
# ============================================================
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']

app = FastAPI(title="Laksono Kontraktor API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ============================================================
# AUTH UTILS
# ============================================================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============================================================
# MODELS
# ============================================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class ProjectBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    category: str  # mini-soccer, futsal, basketball, tennis, volleyball, badminton, running-track, synthetic-grass
    location: str
    surface_type: str
    area_size: str
    completion_year: int
    description: str
    cover_image: str
    gallery: List[str] = []
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    featured: bool = False
    status: Literal["completed", "in-progress", "planned"] = "completed"


class Project(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ServiceBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    slug: str
    title: str
    short_desc: str
    full_desc: str
    icon: str
    image: str
    duration: str
    starting_price: str
    materials: List[str] = []
    workflow: List[str] = []
    features: List[str] = []
    order: int = 0


class Service(ServiceBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    company: Optional[str] = None
    service_type: str
    project_location: Optional[str] = None
    area_size: Optional[str] = None
    budget_range: Optional[str] = None
    message: str


class Inquiry(InquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["new", "contacted", "in-progress", "closed"] = "new"
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class InquiryUpdate(BaseModel):
    status: Optional[Literal["new", "contacted", "in-progress", "closed"]] = None
    notes: Optional[str] = None


class BlogBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    slug: str
    title: str
    excerpt: str
    content: str
    cover_image: str
    category: str
    tags: List[str] = []
    author: str = "Laksono Kontraktor"
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    published: bool = True


class BlogPost(BlogBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TestimonialBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    role: str
    company: str
    avatar: str
    message: str
    rating: int = 5
    project_type: Optional[str] = None


class Testimonial(TestimonialBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class SettingsBase(BaseModel):
    company_name: str = "Laksono Kontraktor"
    tagline: str = "Professional Sports Field Construction Contractor"
    email: str = "info@laksonokontraktor.com"
    phone: str = "+62 812 3456 7890"
    whatsapp: str = "6281234567890"
    address: str = "Jl. Sudirman No. 123, Jakarta, Indonesia"
    google_maps: str = "https://maps.google.com"
    instagram: str = "https://instagram.com/laksonokontraktor"
    facebook: str = "https://facebook.com/laksonokontraktor"
    linkedin: str = "https://linkedin.com/company/laksonokontraktor"
    youtube: str = "https://youtube.com"
    logo_url: str = ""
    seo_title: str = "Laksono Kontraktor - Premium Sports Field Construction"
    seo_description: str = "Trusted sports infrastructure partner across Indonesia"


class Settings(SettingsBase):
    id: str = "main"


# ============================================================
# AUTH ENDPOINTS
# ============================================================
@api.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=False,
        samesite="lax", max_age=8 * 3600, path="/"
    )
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
    }


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ============================================================
# PUBLIC ENDPOINTS
# ============================================================
@api.get("/")
async def root():
    return {"message": "Laksono Kontraktor API", "status": "ok"}


@api.get("/stats")
async def stats():
    projects_count = await db.projects.count_documents({})
    cities = await db.projects.distinct("location")
    return {
        "projects": max(projects_count, 150),
        "cities": max(len(cities), 32),
        "team": 48,
        "years": 12,
    }


# Projects
@api.get("/projects", response_model=List[Project])
async def list_projects(category: Optional[str] = None, featured: Optional[bool] = None, limit: int = 100):
    query = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    docs = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return docs


@api.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Project not found")
    return doc


@api.post("/projects", response_model=Project)
async def create_project(payload: ProjectBase, _: dict = Depends(get_current_user)):
    proj = Project(**payload.model_dump())
    await db.projects.insert_one(proj.model_dump())
    return proj


@api.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, payload: ProjectBase, _: dict = Depends(get_current_user)):
    update_data = payload.model_dump()
    result = await db.projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Project not found")
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return doc


@api.delete("/projects/{project_id}")
async def delete_project(project_id: str, _: dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Project not found")
    return {"deleted": True}


# Services
@api.get("/services", response_model=List[Service])
async def list_services():
    docs = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return docs


@api.get("/services/{slug}", response_model=Service)
async def get_service(slug: str):
    doc = await db.services.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Service not found")
    return doc


@api.post("/services", response_model=Service)
async def create_service(payload: ServiceBase, _: dict = Depends(get_current_user)):
    svc = Service(**payload.model_dump())
    await db.services.insert_one(svc.model_dump())
    return svc


@api.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, payload: ServiceBase, _: dict = Depends(get_current_user)):
    update_data = payload.model_dump()
    result = await db.services.update_one({"id": service_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Service not found")
    doc = await db.services.find_one({"id": service_id}, {"_id": 0})
    return doc


@api.delete("/services/{service_id}")
async def delete_service(service_id: str, _: dict = Depends(get_current_user)):
    await db.services.delete_one({"id": service_id})
    return {"deleted": True}


# Inquiries
@api.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    inq = Inquiry(**payload.model_dump())
    await db.inquiries.insert_one(inq.model_dump())
    return inq


@api.get("/inquiries", response_model=List[Inquiry])
async def list_inquiries(_: dict = Depends(get_current_user), status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    docs = await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.patch("/inquiries/{inquiry_id}", response_model=Inquiry)
async def update_inquiry(inquiry_id: str, payload: InquiryUpdate, _: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    result = await db.inquiries.update_one({"id": inquiry_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Inquiry not found")
    doc = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    return doc


@api.delete("/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str, _: dict = Depends(get_current_user)):
    await db.inquiries.delete_one({"id": inquiry_id})
    return {"deleted": True}


# Blog
@api.get("/blog", response_model=List[BlogPost])
async def list_blog(category: Optional[str] = None, limit: int = 50):
    query = {"published": True}
    if category and category != "all":
        query["category"] = category
    docs = await db.blog.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return docs


@api.get("/blog/{slug}", response_model=BlogPost)
async def get_blog(slug: str):
    doc = await db.blog.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Blog post not found")
    return doc


@api.post("/blog", response_model=BlogPost)
async def create_blog(payload: BlogBase, _: dict = Depends(get_current_user)):
    post = BlogPost(**payload.model_dump())
    await db.blog.insert_one(post.model_dump())
    return post


@api.put("/blog/{post_id}", response_model=BlogPost)
async def update_blog(post_id: str, payload: BlogBase, _: dict = Depends(get_current_user)):
    update_data = payload.model_dump()
    result = await db.blog.update_one({"id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Blog post not found")
    doc = await db.blog.find_one({"id": post_id}, {"_id": 0})
    return doc


@api.delete("/blog/{post_id}")
async def delete_blog(post_id: str, _: dict = Depends(get_current_user)):
    await db.blog.delete_one({"id": post_id})
    return {"deleted": True}


# Testimonials
@api.get("/testimonials", response_model=List[Testimonial])
async def list_testimonials():
    docs = await db.testimonials.find({}, {"_id": 0}).to_list(100)
    return docs


@api.post("/testimonials", response_model=Testimonial)
async def create_testimonial(payload: TestimonialBase, _: dict = Depends(get_current_user)):
    t = Testimonial(**payload.model_dump())
    await db.testimonials.insert_one(t.model_dump())
    return t


@api.delete("/testimonials/{tid}")
async def delete_testimonial(tid: str, _: dict = Depends(get_current_user)):
    await db.testimonials.delete_one({"id": tid})
    return {"deleted": True}


# Settings
@api.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({"id": "main"}, {"_id": 0})
    if not doc:
        default = Settings()
        await db.settings.insert_one(default.model_dump())
        return default
    return doc


@api.put("/settings", response_model=Settings)
async def update_settings(payload: SettingsBase, _: dict = Depends(get_current_user)):
    update_data = payload.model_dump()
    update_data["id"] = "main"
    await db.settings.update_one({"id": "main"}, {"$set": update_data}, upsert=True)
    return Settings(**update_data)


# Admin analytics
@api.get("/admin/overview")
async def admin_overview(_: dict = Depends(get_current_user)):
    projects_count = await db.projects.count_documents({})
    inquiries_count = await db.inquiries.count_documents({})
    new_inquiries = await db.inquiries.count_documents({"status": "new"})
    blog_count = await db.blog.count_documents({})
    services_count = await db.services.count_documents({})

    # Inquiries grouped by month (last 6 months)
    pipeline = [
        {"$group": {"_id": {"$substr": ["$created_at", 0, 7]}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
        {"$limit": 12},
    ]
    monthly_raw = await db.inquiries.aggregate(pipeline).to_list(20)
    monthly = [{"month": m["_id"], "inquiries": m["count"]} for m in monthly_raw]

    # By service type
    type_pipeline = [
        {"$group": {"_id": "$service_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    by_type_raw = await db.inquiries.aggregate(type_pipeline).to_list(20)
    by_type = [{"name": t["_id"] or "Other", "value": t["count"]} for t in by_type_raw]

    return {
        "totals": {
            "projects": projects_count,
            "inquiries": inquiries_count,
            "new_inquiries": new_inquiries,
            "blog_posts": blog_count,
            "services": services_count,
        },
        "monthly_inquiries": monthly,
        "by_service_type": by_type,
    }


# ============================================================
# SEED DATA
# ============================================================
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@laksonokontraktor.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "LaksonoAdmin2025")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrator",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")


SERVICES_SEED = [
    {
        "slug": "mini-soccer",
        "title": "Mini Soccer Field",
        "short_desc": "Premium mini soccer field construction with FIFA-quality synthetic turf.",
        "full_desc": "Complete construction of mini soccer fields with international-grade synthetic grass, professional drainage systems, and stadium lighting.",
        "icon": "Trophy",
        "image": "https://images.unsplash.com/photo-1546717003-caee5f93a9db?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "45-60 days",
        "starting_price": "Rp 850 jt",
        "materials": ["50mm Monofilament Turf", "Rubber Granule Infill", "Shock Pad Base", "LED Stadium Lighting"],
        "workflow": ["Site Survey", "Excavation & Leveling", "Drainage Installation", "Sub-base Compaction", "Turf Installation", "Line Marking", "Final Inspection"],
        "features": ["FIFA Quality 1 Star", "10-year warranty", "Drainage system included", "All-weather playability"],
        "order": 1,
    },
    {
        "slug": "futsal",
        "title": "Futsal Court",
        "short_desc": "Indoor and outdoor futsal court construction with vinyl, interlock or synthetic turf.",
        "full_desc": "Professional futsal court construction featuring premium flooring options, line markings, and goal installations to international standards.",
        "icon": "Goal",
        "image": "https://images.unsplash.com/photo-1550881111-7cfde14b8073?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "30-45 days",
        "starting_price": "Rp 350 jt",
        "materials": ["Vinyl Sports Flooring", "Interlock Tiles", "20mm Synthetic Turf", "Galvanized Goal Posts"],
        "workflow": ["Site Assessment", "Floor Preparation", "Base Layer", "Surface Installation", "Marking & Coating", "Equipment Setup"],
        "features": ["AMF certified surfaces", "5-year warranty", "Shock absorbent", "Anti-slip finish"],
        "order": 2,
    },
    {
        "slug": "basketball",
        "title": "Basketball Court",
        "short_desc": "Professional basketball court construction with acrylic sports flooring system.",
        "full_desc": "Full basketball court construction with premium acrylic surfaces, professional ring installations and FIBA-standard line markings.",
        "icon": "Dribbble",
        "image": "https://images.unsplash.com/photo-1536578524251-eff3c73e9207?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "30-50 days",
        "starting_price": "Rp 450 jt",
        "materials": ["8-layer Acrylic Coating", "Cushioned Sub-base", "FIBA Standard Rings", "Glass Backboards"],
        "workflow": ["Concrete Slab", "Crack Repair", "Primer Layer", "Acrylic Coating", "Line Marking", "Ring Installation"],
        "features": ["FIBA approved", "8-year warranty", "Cushioned surface", "UV-resistant coating"],
        "order": 3,
    },
    {
        "slug": "tennis",
        "title": "Tennis Court",
        "short_desc": "ITF-standard tennis court construction with hard, clay or acrylic surfaces.",
        "full_desc": "Tournament-grade tennis court construction with ITF-approved materials, professional net systems, and proper drainage.",
        "icon": "CircleDot",
        "image": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "40-60 days",
        "starting_price": "Rp 550 jt",
        "materials": ["Acrylic Hard Court", "Tournament Net System", "Galvanized Posts", "Sub-base Drainage"],
        "workflow": ["Site Grading", "Drainage", "Base Construction", "Surface Coating", "Net & Posts", "Markings"],
        "features": ["ITF certified", "10-year structure", "All-weather", "Tournament ready"],
        "order": 4,
    },
    {
        "slug": "volleyball",
        "title": "Volleyball Court",
        "short_desc": "Indoor/outdoor volleyball court construction with sport-specific surfaces.",
        "full_desc": "Complete volleyball facility with FIVB-standard surfaces, professional net systems and ideal court dimensions.",
        "icon": "Volleyball",
        "image": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "25-40 days",
        "starting_price": "Rp 280 jt",
        "materials": ["PU Sports Flooring", "Sand Court Setup", "FIVB Net System", "Boundary Lines"],
        "workflow": ["Layout Planning", "Base Preparation", "Surface Install", "Net Setup", "Line Painting"],
        "features": ["FIVB standard", "Shock absorbing", "5-year warranty", "Multi-court option"],
        "order": 5,
    },
    {
        "slug": "running-track",
        "title": "Running Track",
        "short_desc": "IAAF-certified athletic running track installation with polyurethane surface.",
        "full_desc": "Professional athletic running tracks with IAAF-approved PU surfaces, full markings and stadium-grade construction.",
        "icon": "Activity",
        "image": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "60-90 days",
        "starting_price": "Rp 1.2 M",
        "materials": ["13mm PU Spray Coat", "Sandwich PU System", "EPDM Granules", "IAAF Markings"],
        "workflow": ["Asphalt Base", "Quality Test", "PU Application", "Top Coat", "Lane Marking", "Certification"],
        "features": ["IAAF Class 1", "Olympic-grade", "Shock absorption 35-50%", "15-year lifespan"],
        "order": 6,
    },
    {
        "slug": "synthetic-grass",
        "title": "Synthetic Grass",
        "short_desc": "High-quality synthetic grass installation for sports & landscape applications.",
        "full_desc": "Premium synthetic turf installation for football fields, golf, landscape, and recreational areas with various pile heights.",
        "icon": "Sprout",
        "image": "https://images.unsplash.com/photo-1622460132742-d218ff93958d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "20-40 days",
        "starting_price": "Rp 180 rb/m²",
        "materials": ["50mm Premium Turf", "Silica Sand Infill", "SBR Rubber Granules", "Geotextile Base"],
        "workflow": ["Ground Prep", "Edge Setup", "Turf Roll-out", "Seaming", "Infill Spread", "Brushing"],
        "features": ["UV stabilized", "Drainage 60L/min/m²", "Lead-free", "8-year warranty"],
        "order": 7,
    },
    {
        "slug": "acrylic-flooring",
        "title": "Acrylic Sports Flooring",
        "short_desc": "Premium acrylic coating systems for multi-sport courts.",
        "full_desc": "Multi-layer acrylic sports flooring systems suitable for basketball, tennis, badminton and multi-purpose courts.",
        "icon": "Layers",
        "image": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "duration": "15-30 days",
        "starting_price": "Rp 250 rb/m²",
        "materials": ["Acrylic Resurfacer", "Color Coating", "Texture Coating", "Line Paint"],
        "workflow": ["Surface Prep", "Crack Fill", "Resurfacer", "Color Layers", "Line Marking"],
        "features": ["8-layer system", "UV resistant", "Anti-slip", "Custom colors"],
        "order": 8,
    },
]


PROJECTS_SEED = [
    {
        "title": "Jakarta International Mini Soccer Arena",
        "category": "mini-soccer",
        "location": "Jakarta Selatan",
        "surface_type": "FIFA Quality Synthetic Turf 50mm",
        "area_size": "1,200 m²",
        "completion_year": 2024,
        "description": "Premium mini soccer facility featuring FIFA-quality turf, LED stadium lighting, and advanced drainage system for year-round playability.",
        "cover_image": "https://images.unsplash.com/photo-1546717003-caee5f93a9db?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": [
            "https://images.unsplash.com/photo-1546717003-caee5f93a9db?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
            "https://images.unsplash.com/photo-1622460132742-d218ff93958d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        ],
        "before_image": "https://images.unsplash.com/photo-1581094271901-8022df4466f9?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "after_image": "https://images.unsplash.com/photo-1546717003-caee5f93a9db?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "featured": True,
        "status": "completed",
    },
    {
        "title": "Surabaya Basketball Complex",
        "category": "basketball",
        "location": "Surabaya",
        "surface_type": "8-Layer Acrylic Sports Coating",
        "area_size": "608 m²",
        "completion_year": 2024,
        "description": "FIBA-standard basketball complex with cushioned acrylic surface, professional ring systems, and tournament-grade line markings.",
        "cover_image": "https://images.unsplash.com/photo-1536578524251-eff3c73e9207?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": [
            "https://images.unsplash.com/photo-1536578524251-eff3c73e9207?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
            "https://images.unsplash.com/photo-1600534220378-df36338afc40?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        ],
        "before_image": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "after_image": "https://images.unsplash.com/photo-1536578524251-eff3c73e9207?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "featured": True,
        "status": "completed",
    },
    {
        "title": "Bandung Futsal Arena Premier",
        "category": "futsal",
        "location": "Bandung",
        "surface_type": "Vinyl Sports Flooring 6mm",
        "area_size": "800 m²",
        "completion_year": 2023,
        "description": "Indoor futsal facility with AMF-certified vinyl flooring, professional goal systems, and integrated LED lighting.",
        "cover_image": "https://images.unsplash.com/photo-1550881111-7cfde14b8073?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": ["https://images.unsplash.com/photo-1550881111-7cfde14b8073?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "featured": True,
        "status": "completed",
    },
    {
        "title": "Bali Athletic Running Track",
        "category": "running-track",
        "location": "Denpasar, Bali",
        "surface_type": "13mm PU Sandwich System",
        "area_size": "4,800 m² (400m track)",
        "completion_year": 2024,
        "description": "IAAF Class 1 certified running track with 8 lanes, full field events markings, and Olympic-grade polyurethane surface.",
        "cover_image": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": ["https://images.unsplash.com/photo-1571008887538-b36bb32f4571?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "featured": True,
        "status": "completed",
    },
    {
        "title": "Medan Tennis Center",
        "category": "tennis",
        "location": "Medan",
        "surface_type": "Acrylic Hard Court ITF",
        "area_size": "650 m² × 4 courts",
        "completion_year": 2023,
        "description": "Tournament-grade tennis center featuring 4 ITF-certified hard courts with professional net systems and spectator areas.",
        "cover_image": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "featured": False,
        "status": "completed",
    },
    {
        "title": "Yogyakarta Multi-Sport Complex",
        "category": "synthetic-grass",
        "location": "Yogyakarta",
        "surface_type": "Premium Monofilament Turf",
        "area_size": "2,400 m²",
        "completion_year": 2024,
        "description": "Multi-functional sports complex with synthetic grass football pitch and integrated training facilities.",
        "cover_image": "https://images.unsplash.com/photo-1622460132742-d218ff93958d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": ["https://images.unsplash.com/photo-1622460132742-d218ff93958d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "featured": True,
        "status": "completed",
    },
    {
        "title": "Semarang Volleyball Center",
        "category": "volleyball",
        "location": "Semarang",
        "surface_type": "PU Sports Flooring",
        "area_size": "324 m² × 2 courts",
        "completion_year": 2023,
        "description": "FIVB-standard volleyball facility with shock-absorbing PU surface and tournament net systems.",
        "cover_image": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": ["https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "featured": False,
        "status": "completed",
    },
    {
        "title": "Makassar Sports Pavilion",
        "category": "acrylic-flooring",
        "location": "Makassar",
        "surface_type": "Multi-sport Acrylic Coating",
        "area_size": "1,500 m²",
        "completion_year": 2024,
        "description": "Multi-purpose pavilion with versatile acrylic flooring system for basketball, badminton, and volleyball.",
        "cover_image": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "gallery": ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "featured": False,
        "status": "in-progress",
    },
]


TESTIMONIALS_SEED = [
    {
        "name": "Bapak Ahmad Hidayat",
        "role": "Direktur",
        "company": "PT Bumi Sportindo",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
        "message": "Laksono Kontraktor menyelesaikan proyek mini soccer kami dengan kualitas world-class. Timeline tepat waktu, hasil akhir luar biasa, dan kualitas turf-nya benar-benar premium.",
        "rating": 5,
        "project_type": "Mini Soccer",
    },
    {
        "name": "Mrs. Sarah Wijaya",
        "role": "Facility Manager",
        "company": "Senayan Sports Complex",
        "avatar": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
        "message": "Profesionalisme tim sangat tinggi. Kami menggunakan jasa mereka untuk lapangan basket dan tenis, dan hasilnya sesuai standar internasional.",
        "rating": 5,
        "project_type": "Basketball & Tennis",
    },
    {
        "name": "Bapak Reza Pratama",
        "role": "Owner",
        "company": "Pratama Futsal Bandung",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
        "message": "Sudah 3 lokasi futsal kami dibangun oleh Laksono. Konsistensi kualitas dan layanan after-sales-nya membuat kami selalu kembali.",
        "rating": 5,
        "project_type": "Futsal",
    },
    {
        "name": "Ibu Devi Kartika",
        "role": "Project Manager",
        "company": "Kota Bali Athletic Foundation",
        "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
        "message": "Running track kami mendapat sertifikasi IAAF berkat ketelitian Laksono Kontraktor. Sangat direkomendasikan untuk proyek atletik profesional.",
        "rating": 5,
        "project_type": "Running Track",
    },
]


BLOG_SEED = [
    {
        "slug": "panduan-memilih-rumput-sintetis",
        "title": "Panduan Lengkap Memilih Rumput Sintetis untuk Lapangan Sepak Bola",
        "excerpt": "Pelajari faktor penting dalam memilih rumput sintetis berkualitas tinggi: pile height, infill, dan sertifikasi FIFA.",
        "content": "Memilih rumput sintetis yang tepat adalah kunci performa lapangan sepak bola modern...\n\nPile height ideal untuk lapangan sepak bola adalah 50-60mm dengan monofilament yarn yang tahan UV. Sertifikasi FIFA Quality dan FIFA Quality Pro menjamin kualitas internasional. Sistem infill yang baik menggunakan kombinasi silica sand dan SBR rubber granules untuk shock absorption optimal.",
        "cover_image": "https://images.unsplash.com/photo-1622460132742-d218ff93958d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "category": "Material Guide",
        "tags": ["synthetic grass", "soccer", "material"],
        "author": "Tim Engineering Laksono",
        "seo_title": "Panduan Rumput Sintetis FIFA Quality - Laksono Kontraktor",
        "seo_description": "Tips memilih rumput sintetis berkualitas FIFA untuk lapangan sepak bola.",
        "published": True,
    },
    {
        "slug": "perbandingan-lantai-olahraga-akrilik",
        "title": "Perbandingan Sistem Lantai Akrilik untuk Lapangan Basket",
        "excerpt": "Cushioned vs hard acrylic system: mana yang terbaik untuk lapangan basket Anda?",
        "content": "Sistem lantai akrilik memiliki beberapa varian dengan keunggulan masing-masing...\n\nCushioned acrylic system menyediakan shock absorption 8-12% yang ideal untuk pemain. Hard acrylic system memberi respon bola yang lebih cepat dan cocok untuk kompetisi resmi. Sertifikasi FIBA dan ITF menjamin spesifikasi internasional.",
        "cover_image": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "category": "Comparison",
        "tags": ["acrylic", "basketball", "flooring"],
        "author": "Tim Engineering Laksono",
        "seo_title": "Perbandingan Lantai Akrilik Basket - Laksono Kontraktor",
        "seo_description": "Pilihan sistem lantai akrilik terbaik untuk lapangan basket profesional.",
        "published": True,
    },
    {
        "slug": "maintenance-lapangan-futsal",
        "title": "Tips Perawatan Lapangan Futsal Agar Tahan Lama",
        "excerpt": "Maintenance rutin lapangan futsal yang membuat lifespan investasi Anda lebih panjang.",
        "content": "Perawatan rutin adalah kunci memperpanjang usia lapangan futsal Anda...\n\nLakukan pembersihan harian dengan brushing lembut, recoating setiap 3-5 tahun, dan inspeksi struktural setiap 6 bulan. Hindari penggunaan sepatu non-sport dan benda tajam.",
        "cover_image": "https://images.unsplash.com/photo-1550881111-7cfde14b8073?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
        "category": "Maintenance",
        "tags": ["futsal", "maintenance", "tips"],
        "author": "Tim Engineering Laksono",
        "seo_title": "Tips Maintenance Lapangan Futsal - Laksono Kontraktor",
        "seo_description": "Panduan perawatan lapangan futsal profesional.",
        "published": True,
    },
]


async def seed_content():
    if await db.services.count_documents({}) == 0:
        await db.services.insert_many([Service(**s).model_dump() for s in SERVICES_SEED])
        logger.info("Services seeded")
    if await db.projects.count_documents({}) == 0:
        await db.projects.insert_many([Project(**p).model_dump() for p in PROJECTS_SEED])
        logger.info("Projects seeded")
    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([Testimonial(**t).model_dump() for t in TESTIMONIALS_SEED])
        logger.info("Testimonials seeded")
    if await db.blog.count_documents({}) == 0:
        await db.blog.insert_many([BlogPost(**b).model_dump() for b in BLOG_SEED])
        logger.info("Blog seeded")
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one(Settings().model_dump())
        logger.info("Settings seeded")


# ============================================================
# APP WIRING
# ============================================================
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("category")
    await db.services.create_index("slug", unique=True)
    await db.blog.create_index("slug", unique=True)
    await seed_admin()
    await seed_content()


@app.on_event("shutdown")
async def shutdown():
    client.close()
