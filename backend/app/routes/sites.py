from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.heritage_site import HeritageSite
from app.schemas.heritage_site import HeritageSiteCreate, HeritageSiteUpdate, HeritageSiteOut
from app.services.auth_service import require_admin

router = APIRouter(prefix="/sites", tags=["heritage-sites"])


@router.get("/", response_model=List[HeritageSiteOut])
def list_sites(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(HeritageSite).offset(skip).limit(limit).all()


@router.get("/{site_id}", response_model=HeritageSiteOut)
def get_site(site_id: UUID, db: Session = Depends(get_db)):
    site = db.query(HeritageSite).filter(HeritageSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    return site


@router.post("/", response_model=HeritageSiteOut, status_code=status.HTTP_201_CREATED)
def create_site(payload: HeritageSiteCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    site = HeritageSite(**payload.dict())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


@router.put("/{site_id}", response_model=HeritageSiteOut)
def update_site(site_id: UUID, payload: HeritageSiteUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    site = db.query(HeritageSite).filter(HeritageSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(site, field, value)
    db.commit()
    db.refresh(site)
    return site


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(site_id: UUID, db: Session = Depends(get_db), _=Depends(require_admin)):
    site = db.query(HeritageSite).filter(HeritageSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    db.delete(site)
    db.commit()
