from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.heritage_site import HeritageSite
from app.models.feedback import Feedback
from app.models.favorite import Favorite
from app.models.journey import Journey
from app.schemas.user import UserOut
from app.schemas.heritage_site import HeritageSiteCreate, HeritageSiteUpdate, HeritageSiteOut
from app.schemas.feedback import FeedbackOut
from app.services.auth_service import require_admin
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class UserRoleUpdate(BaseModel):
    role: str  # "user" | "admin"


class StatsOut(BaseModel):
    total_users: int
    total_sites: int
    total_feedback: int
    total_journeys: int
    total_favorites: int


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    return StatsOut(
        total_users=db.query(User).count(),
        total_sites=db.query(HeritageSite).count(),
        total_feedback=db.query(Feedback).count(),
        total_journeys=db.query(Journey).count(),
        total_favorites=db.query(Favorite).count(),
    )


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: UUID,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    if payload.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(user.id) == str(current_admin.id):
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    if str(user_id) == str(current_admin.id):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


# ── Heritage Sites ────────────────────────────────────────────────────────────

@router.post("/sites", response_model=HeritageSiteOut, status_code=status.HTTP_201_CREATED)
def create_site(
    payload: HeritageSiteCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    site = HeritageSite(**payload.dict())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


@router.put("/sites/{site_id}", response_model=HeritageSiteOut)
def update_site(
    site_id: UUID,
    payload: HeritageSiteUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    site = db.query(HeritageSite).filter(HeritageSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(site, field, value)
    db.commit()
    db.refresh(site)
    return site


@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    site = db.query(HeritageSite).filter(HeritageSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()


# ── Feedback ──────────────────────────────────────────────────────────────────

@router.get("/feedback", response_model=List[FeedbackOut])
def list_feedback(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()


@router.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(
    feedback_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(fb)
    db.commit()
