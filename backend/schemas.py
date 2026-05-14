"""Pydantic schemas — request/response validation."""
from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict, Field


# ============ AUTH ============
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    name: str
    role: str


# ============ PROJECT ============
class ProjectBase(BaseModel):
    title: str
    category: str
    location: str
    surface_type: str
    area_size: str
    completion_year: int
    description: str
    cover_image: str
    gallery: List[str] = Field(default_factory=list)
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    featured: bool = False
    status: Literal["completed", "in-progress", "planned"] = "completed"


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime


# ============ SERVICE ============
class ServiceBase(BaseModel):
    slug: str
    title: str
    short_desc: str
    full_desc: str
    icon: str = "Trophy"
    image: str
    duration: str = ""
    starting_price: str = ""
    materials: List[str] = Field(default_factory=list)
    workflow: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    order: int = 0


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    title: str
    short_desc: str
    full_desc: str
    icon: str
    image: str
    duration: str
    starting_price: str
    materials: List[str]
    workflow: List[str]
    features: List[str]
    order: int = Field(alias="order_idx")


# ============ INQUIRY ============
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


class InquiryOut(InquiryCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    status: str
    notes: Optional[str] = None
    created_at: datetime


class InquiryUpdate(BaseModel):
    status: Optional[Literal["new", "contacted", "in-progress", "closed"]] = None
    notes: Optional[str] = None


# ============ BLOG ============
class BlogBase(BaseModel):
    slug: str
    title: str
    excerpt: str
    content: str
    cover_image: str
    category: str = "Insight"
    tags: List[str] = Field(default_factory=list)
    author: str = "Laksono Kontraktor"
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    published: bool = True


class BlogOut(BlogBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime


# ============ TESTIMONIAL ============
class TestimonialBase(BaseModel):
    name: str
    role: str
    company: str
    avatar: str
    message: str
    rating: int = 5
    project_type: Optional[str] = None


class TestimonialOut(TestimonialBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


# ============ SETTINGS ============
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


class SettingsOut(SettingsBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
