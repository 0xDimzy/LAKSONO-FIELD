# Laksono Kontraktor - Product Requirements Document

## Original Problem Statement
Build a premium modern website for "Laksono Kontraktor", a professional sports field construction contractor company in Indonesia, including:
- Public marketing website (Hero, About, Services, Portfolio, Process, Testimonials, Blog, FAQ, Contact)
- Complete admin dashboard (Projects, Services, Inquiries, Blog CMS, Testimonials, Settings)
- Multi-language: Indonesian / English / Arabic (with RTL)
- Dark / light theme
- Premium navy + emerald + orange palette

## Tech Stack (Implemented)
- **Backend**: FastAPI + MongoDB (motor) + JWT auth (bcrypt + pyjwt)
- **Frontend**: React 19 + React Router + Framer Motion + Tailwind CSS + Shadcn UI + Recharts
- **Fonts**: Inter Tight (display) + Manrope (body) + Noto Naskh Arabic (Arabic)

## User Personas
1. **Visitor / Prospective Client** — browses site, fills inquiry form, downloads info
2. **Admin** — manages projects, services, inquiries, blog, testimonials, settings

## Core Requirements (Static)
- Premium contractor branding (navy + emerald + orange)
- Realistic sports construction visuals (Unsplash)
- Multi-language ID/EN/AR with RTL
- Dark/light mode
- Mobile responsive
- Floating WhatsApp button
- SEO-friendly structure

## What's Been Implemented (2025-12-14)
### Public Website
- ✅ Sticky transparent navbar with language switcher + theme toggle
- ✅ Cinematic hero with animated stats counters
- ✅ About section with mission/vision
- ✅ Services bento grid (8 categories) with hover animations
- ✅ Portfolio with category filter + before/after slider modal
- ✅ Why-Choose-Us cards
- ✅ 7-step construction process timeline
- ✅ Testimonials grid
- ✅ Blog preview + list + detail pages
- ✅ FAQ accordion
- ✅ Contact form (writes to /api/inquiries)
- ✅ Footer with social links
- ✅ Floating WhatsApp button
- ✅ Service detail pages (/services/:slug)
- ✅ Projects browse page (/projects) with filters

### Admin Dashboard
- ✅ JWT login with secure cookie + Bearer fallback
- ✅ Glass-morphism sidebar + topbar layout
- ✅ Overview with stat cards + BarChart + PieChart
- ✅ Projects CRUD with before/after, gallery, featured flag
- ✅ Services CRUD (8 seeded)
- ✅ Inquiries management (filter by status, status update, internal notes)
- ✅ Blog CMS with SEO fields
- ✅ Testimonials CRUD
- ✅ Settings page (company, contact, social, SEO)

### Backend APIs
- Auth: login, logout, me
- Public: stats, services, projects, blog, testimonials, settings, inquiries (POST)
- Admin: full CRUD on projects/services/blog/testimonials/inquiries, admin/overview analytics

## Test Coverage
- Backend: 31/31 pytest tests passed
- Frontend: All major flows verified by testing agent
- Test file: /app/backend/tests/backend_test.py

## Backlog (P1 / P2)
- P1: Image upload to local storage / S3 (currently URL-based)
- P1: Rich text editor for blog content (currently textarea)
- P1: PDF company profile download
- P1: Google Maps embed in contact section
- P2: Live chat widget integration
- P2: Multi-admin roles + activity logs
- P2: Email notifications on new inquiry (Resend/SendGrid)
- P2: Migrate translations to react-i18next for plural/interpolation

## Test Credentials
See `/app/memory/test_credentials.md`
