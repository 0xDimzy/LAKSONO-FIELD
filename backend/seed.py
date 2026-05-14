"""One-off seed script.

Run from repo root:
    python -m backend.seed

Idempotent: only inserts if records don't already exist.
"""
import asyncio
import os
import logging
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

from sqlalchemy import select, func
from .database import AsyncSessionLocal
from . import models
from .auth import hash_password, verify_password
from .seed_data import SERVICES_SEED, PROJECTS_SEED, TESTIMONIALS_SEED, BLOG_SEED

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("seed")


async def seed_admin(db):
    email = os.environ.get("ADMIN_EMAIL", "admin@laksonokontraktor.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "LaksonoAdmin2025")
    result = await db.execute(select(models.User).where(models.User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        db.add(models.User(email=email, password_hash=hash_password(password)))
        await db.commit()
        log.info(f"Admin created: {email}")
    elif not verify_password(password, user.password_hash):
        user.password_hash = hash_password(password)
        await db.commit()
        log.info(f"Admin password updated: {email}")
    else:
        log.info(f"Admin already exists: {email}")


async def _count(db, model):
    return (await db.execute(select(func.count()).select_from(model))).scalar() or 0


async def seed_content(db):
    if await _count(db, models.Service) == 0:
        db.add_all([models.Service(**s) for s in SERVICES_SEED])
        await db.commit()
        log.info(f"Inserted {len(SERVICES_SEED)} services")

    if await _count(db, models.Project) == 0:
        db.add_all([models.Project(**p) for p in PROJECTS_SEED])
        await db.commit()
        log.info(f"Inserted {len(PROJECTS_SEED)} projects")

    if await _count(db, models.Testimonial) == 0:
        db.add_all([models.Testimonial(**t) for t in TESTIMONIALS_SEED])
        await db.commit()
        log.info(f"Inserted {len(TESTIMONIALS_SEED)} testimonials")

    if await _count(db, models.BlogPost) == 0:
        db.add_all([models.BlogPost(**b) for b in BLOG_SEED])
        await db.commit()
        log.info(f"Inserted {len(BLOG_SEED)} blog posts")

    result = await db.execute(select(models.Settings).where(models.Settings.id == "main"))
    if result.scalar_one_or_none() is None:
        db.add(models.Settings(id="main"))
        await db.commit()
        log.info("Inserted default settings")


async def main():
    async with AsyncSessionLocal() as db:
        await seed_admin(db)
        await seed_content(db)
    log.info("✅ Seed complete.")


if __name__ == "__main__":
    asyncio.run(main())
