from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.journey import Journey, JourneySite
from app.schemas.journey import JourneyCreate, JourneyOut, JourneySiteCreate, JourneySiteOut
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/journeys", tags=["journeys"])


@router.post("/", response_model=JourneyOut, status_code=status.HTTP_201_CREATED)
def create_journey(
    payload: JourneyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    journey = Journey(user_id=current_user.id, title=payload.title)
    db.add(journey)
    db.commit()
    db.refresh(journey)
    return journey


@router.get("/", response_model=List[JourneyOut])
def list_journeys(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Journey).filter(Journey.user_id == current_user.id).all()


@router.post("/{journey_id}/sites", response_model=JourneySiteOut, status_code=status.HTTP_201_CREATED)
def add_site_to_journey(
    journey_id: UUID,
    payload: JourneySiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    journey = db.query(Journey).filter(
        Journey.id == journey_id, Journey.user_id == current_user.id
    ).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    js = JourneySite(
        journey_id=journey_id,
        heritage_site_id=payload.heritage_site_id,
        order_index=payload.order_index,
    )
    db.add(js)
    db.commit()
    db.refresh(js)
    return js


@router.get("/{journey_id}/sites", response_model=List[JourneySiteOut])
def list_journey_sites(
    journey_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    journey = db.query(Journey).filter(
        Journey.id == journey_id, Journey.user_id == current_user.id
    ).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    return db.query(JourneySite).filter(JourneySite.journey_id == journey_id).order_by(JourneySite.order_index).all()


@router.delete("/{journey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journey(
    journey_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    journey = db.query(Journey).filter(
        Journey.id == journey_id, Journey.user_id == current_user.id
    ).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    db.delete(journey)
    db.commit()
