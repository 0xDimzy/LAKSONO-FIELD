"""Laksono Kontraktor - FastAPI Backend (Supabase PostgreSQL)."""
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

import os
import logging
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db
from . import models, schemas
from .auth import (
    hash_password, verify_password, create_access_token, get_current_user,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Laksono Kontraktor API", version="1.0.0")
api = APIRouter(prefix="/api")


# ============================================================
# AUTH
# ============================================================
@api.post("/auth/login")
async def login(payload: schemas.LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower()
    result = await db.execute(select(models.User).where(models.User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    token = create_access_token(user.id, user.email)
    response.set_cookie(
        "access_token", token, httponly=True, secure=False, samesite="lax",
        max_age=8 * 3600, path="/",
    )
    return {
        "token": token,
        "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role},
    }


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@api.get("/auth/me", response_model=schemas.UserOut)
async def me(user: models.User = Depends(get_current_user)):
    return user


# ============================================================
# PUBLIC
# ============================================================
@api.get("/")
async def root():
    return {"message": "Laksono Kontraktor API", "status": "ok"}


@api.get("/stats")
async def stats(db: AsyncSession = Depends(get_db)):
    projects_count = (await db.execute(select(func.count()).select_from(models.Project))).scalar() or 0
    cities_count = (await db.execute(select(func.count(func.distinct(models.Project.location))))).scalar() or 0
    return {
        "projects": max(projects_count, 150),
        "cities": max(cities_count, 32),
        "team": 48,
        "years": 12,
    }


# ----- Projects -----
@api.get("/projects", response_model=List[schemas.ProjectOut])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 100,
):
    q = select(models.Project)
    if category and category != "all":
        q = q.where(models.Project.category == category)
    if featured is not None:
        q = q.where(models.Project.featured == featured)
    q = q.order_by(models.Project.created_at.desc()).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@api.get("/projects/{project_id}", response_model=schemas.ProjectOut)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project).where(models.Project.id == project_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Project not found")
    return p


@api.post("/projects", response_model=schemas.ProjectOut)
async def create_project(
    payload: schemas.ProjectBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    p = models.Project(**payload.model_dump())
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p


@api.put("/projects/{project_id}", response_model=schemas.ProjectOut)
async def update_project(
    project_id: str, payload: schemas.ProjectBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.Project).where(models.Project.id == project_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Project not found")
    for k, v in payload.model_dump().items():
        setattr(p, k, v)
    await db.commit()
    await db.refresh(p)
    return p


@api.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(delete(models.Project).where(models.Project.id == project_id))
    if result.rowcount == 0:
        raise HTTPException(404, "Project not found")
    await db.commit()
    return {"deleted": True}


# ----- Services -----
@api.get("/services", response_model=List[schemas.ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service).order_by(models.Service.order_idx))
    return result.scalars().all()


@api.get("/services/{slug}", response_model=schemas.ServiceOut)
async def get_service(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service).where(models.Service.slug == slug))
    s = result.scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Service not found")
    return s


@api.post("/services", response_model=schemas.ServiceOut)
async def create_service(
    payload: schemas.ServiceBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["order_idx"] = data.pop("order", 0)
    s = models.Service(**data)
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s


@api.put("/services/{service_id}", response_model=schemas.ServiceOut)
async def update_service(
    service_id: str, payload: schemas.ServiceBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.Service).where(models.Service.id == service_id))
    s = result.scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Service not found")
    data = payload.model_dump()
    data["order_idx"] = data.pop("order", 0)
    for k, v in data.items():
        setattr(s, k, v)
    await db.commit()
    await db.refresh(s)
    return s


@api.delete("/services/{service_id}")
async def delete_service(
    service_id: str,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(delete(models.Service).where(models.Service.id == service_id))
    await db.commit()
    return {"deleted": True}


# ----- Inquiries -----
@api.post("/inquiries", response_model=schemas.InquiryOut)
async def create_inquiry(payload: schemas.InquiryCreate, db: AsyncSession = Depends(get_db)):
    inq = models.Inquiry(**payload.model_dump())
    db.add(inq)
    await db.commit()
    await db.refresh(inq)
    return inq


@api.get("/inquiries", response_model=List[schemas.InquiryOut])
async def list_inquiries(
    db: AsyncSession = Depends(get_db),
    _: models.User = Depends(get_current_user),
    status: Optional[str] = None,
):
    q = select(models.Inquiry)
    if status:
        q = q.where(models.Inquiry.status == status)
    q = q.order_by(models.Inquiry.created_at.desc()).limit(500)
    result = await db.execute(q)
    return result.scalars().all()


@api.patch("/inquiries/{inquiry_id}", response_model=schemas.InquiryOut)
async def update_inquiry(
    inquiry_id: str, payload: schemas.InquiryUpdate,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.Inquiry).where(models.Inquiry.id == inquiry_id))
    inq = result.scalar_one_or_none()
    if not inq:
        raise HTTPException(404, "Inquiry not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    for k, v in data.items():
        setattr(inq, k, v)
    await db.commit()
    await db.refresh(inq)
    return inq


@api.delete("/inquiries/{inquiry_id}")
async def delete_inquiry(
    inquiry_id: str,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(delete(models.Inquiry).where(models.Inquiry.id == inquiry_id))
    await db.commit()
    return {"deleted": True}


# ----- Blog -----
@api.get("/blog", response_model=List[schemas.BlogOut])
async def list_blog(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = None,
    limit: int = 50,
):
    q = select(models.BlogPost).where(models.BlogPost.published == True)  # noqa: E712
    if category and category != "all":
        q = q.where(models.BlogPost.category == category)
    q = q.order_by(models.BlogPost.created_at.desc()).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@api.get("/blog/{slug}", response_model=schemas.BlogOut)
async def get_blog(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.BlogPost).where(models.BlogPost.slug == slug))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Blog post not found")
    return p


@api.post("/blog", response_model=schemas.BlogOut)
async def create_blog(
    payload: schemas.BlogBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = models.BlogPost(**payload.model_dump())
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


@api.put("/blog/{post_id}", response_model=schemas.BlogOut)
async def update_blog(
    post_id: str, payload: schemas.BlogBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.BlogPost).where(models.BlogPost.id == post_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Blog post not found")
    for k, v in payload.model_dump().items():
        setattr(p, k, v)
    await db.commit()
    await db.refresh(p)
    return p


@api.delete("/blog/{post_id}")
async def delete_blog(
    post_id: str,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(delete(models.BlogPost).where(models.BlogPost.id == post_id))
    await db.commit()
    return {"deleted": True}


# ----- Testimonials -----
@api.get("/testimonials", response_model=List[schemas.TestimonialOut])
async def list_testimonials(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Testimonial))
    return result.scalars().all()


@api.post("/testimonials", response_model=schemas.TestimonialOut)
async def create_testimonial(
    payload: schemas.TestimonialBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t = models.Testimonial(**payload.model_dump())
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return t


@api.delete("/testimonials/{tid}")
async def delete_testimonial(
    tid: str,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(delete(models.Testimonial).where(models.Testimonial.id == tid))
    await db.commit()
    return {"deleted": True}


# ----- Settings -----
@api.get("/settings", response_model=schemas.SettingsOut)
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Settings).where(models.Settings.id == "main"))
    s = result.scalar_one_or_none()
    if not s:
        s = models.Settings(id="main")
        db.add(s)
        await db.commit()
        await db.refresh(s)
    return s


@api.put("/settings", response_model=schemas.SettingsOut)
async def update_settings(
    payload: schemas.SettingsBase,
    _: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.Settings).where(models.Settings.id == "main"))
    s = result.scalar_one_or_none()
    if not s:
        s = models.Settings(id="main", **payload.model_dump())
        db.add(s)
    else:
        for k, v in payload.model_dump().items():
            setattr(s, k, v)
    await db.commit()
    await db.refresh(s)
    return s


# ----- Admin Analytics -----
@api.get("/admin/overview")
async def admin_overview(
    db: AsyncSession = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    projects_count = (await db.execute(select(func.count()).select_from(models.Project))).scalar() or 0
    inquiries_count = (await db.execute(select(func.count()).select_from(models.Inquiry))).scalar() or 0
    new_inquiries = (await db.execute(
        select(func.count()).select_from(models.Inquiry).where(models.Inquiry.status == "new")
    )).scalar() or 0
    blog_count = (await db.execute(select(func.count()).select_from(models.BlogPost))).scalar() or 0
    services_count = (await db.execute(select(func.count()).select_from(models.Service))).scalar() or 0

    # Monthly inquiries (group by year-month)
    month_expr = func.to_char(models.Inquiry.created_at, "YYYY-MM").label("month")
    monthly_q = (
        select(month_expr, func.count().label("count"))
        .group_by(month_expr)
        .order_by(month_expr)
        .limit(12)
    )
    monthly_rows = (await db.execute(monthly_q)).all()
    monthly = [{"month": r.month, "inquiries": r.count} for r in monthly_rows]

    # By service type
    type_q = (
        select(models.Inquiry.service_type, func.count().label("count"))
        .group_by(models.Inquiry.service_type)
        .order_by(func.count().desc())
    )
    type_rows = (await db.execute(type_q)).all()
    by_type = [{"name": r.service_type or "Other", "value": r.count} for r in type_rows]

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
# APP WIRING
# ============================================================
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
