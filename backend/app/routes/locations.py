# Kept for backward compatibility — use /sites instead
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.heritage_site import HeritageSite

router = APIRouter(tags=["legacy"])


@router.get("/locations")
def fetch_locations(db: Session = Depends(get_db)):
    sites = db.query(HeritageSite).limit(50).all()
    return {"locations": [{"id": str(s.id), "name": s.name, "latitude": s.latitude, "longitude": s.longitude} for s in sites]}
