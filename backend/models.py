"""SQLAlchemy models for Laksono Kontraktor."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Boolean, Text, DateTime, ARRAY,
)
from .database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(120), nullable=False, default="Administrator")
    role = Column(String(40), nullable=False, default="admin")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(255), nullable=False)
    category = Column(String(60), nullable=False, index=True)
    location = Column(String(120), nullable=False)
    surface_type = Column(String(120), nullable=False)
    area_size = Column(String(80), nullable=False)
    completion_year = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    cover_image = Column(Text, nullable=False)
    gallery = Column(ARRAY(Text), default=list, nullable=False)
    before_image = Column(Text)
    after_image = Column(Text)
    featured = Column(Boolean, default=False, nullable=False, index=True)
    status = Column(String(20), default="completed", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class Service(Base):
    __tablename__ = "services"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    slug = Column(String(80), unique=True, nullable=False, index=True)
    title = Column(String(160), nullable=False)
    short_desc = Column(Text, nullable=False)
    full_desc = Column(Text, nullable=False)
    icon = Column(String(80), default="Trophy", nullable=False)
    image = Column(Text, nullable=False)
    duration = Column(String(60), default="", nullable=False)
    starting_price = Column(String(60), default="", nullable=False)
    materials = Column(ARRAY(Text), default=list, nullable=False)
    workflow = Column(ARRAY(Text), default=list, nullable=False)
    features = Column(ARRAY(Text), default=list, nullable=False)
    order_idx = Column("order_idx", Integer, default=0, nullable=False)


class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(160), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(40), nullable=False)
    company = Column(String(160))
    service_type = Column(String(160), nullable=False)
    project_location = Column(String(160))
    area_size = Column(String(80))
    budget_range = Column(String(80))
    message = Column(Text, nullable=False)
    status = Column(String(20), default="new", nullable=False, index=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)


class BlogPost(Base):
    __tablename__ = "blog_posts"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    slug = Column(String(160), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    excerpt = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    cover_image = Column(Text, nullable=False)
    category = Column(String(80), default="Insight", nullable=False, index=True)
    tags = Column(ARRAY(Text), default=list, nullable=False)
    author = Column(String(120), default="Laksono Kontraktor", nullable=False)
    seo_title = Column(String(255))
    seo_description = Column(Text)
    published = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(160), nullable=False)
    role = Column(String(120), nullable=False)
    company = Column(String(160), nullable=False)
    avatar = Column(Text, nullable=False)
    message = Column(Text, nullable=False)
    rating = Column(Integer, default=5, nullable=False)
    project_type = Column(String(120))


class Settings(Base):
    __tablename__ = "settings"
    id = Column(String(36), primary_key=True, default=lambda: "main")
    company_name = Column(String(160), default="Laksono Kontraktor", nullable=False)
    tagline = Column(String(255), default="Professional Sports Field Construction Contractor", nullable=False)
    email = Column(String(255), default="info@laksonokontraktor.com", nullable=False)
    phone = Column(String(40), default="+62 812 3456 7890", nullable=False)
    whatsapp = Column(String(40), default="6281234567890", nullable=False)
    address = Column(Text, default="Jl. Sudirman No. 123, Jakarta, Indonesia", nullable=False)
    google_maps = Column(Text, default="https://maps.google.com", nullable=False)
    instagram = Column(Text, default="https://instagram.com/laksonokontraktor", nullable=False)
    facebook = Column(Text, default="https://facebook.com/laksonokontraktor", nullable=False)
    linkedin = Column(Text, default="https://linkedin.com/company/laksonokontraktor", nullable=False)
    youtube = Column(Text, default="https://youtube.com", nullable=False)
    logo_url = Column(Text, default="", nullable=False)
    seo_title = Column(String(255), default="Laksono Kontraktor - Premium Sports Field Construction", nullable=False)
    seo_description = Column(Text, default="Trusted sports infrastructure partner across Indonesia", nullable=False)
