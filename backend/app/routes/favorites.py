from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteCreate, FavoriteOut
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("/", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED)
def add_favorite(
    payload: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.heritage_site_id == payload.heritage_site_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")

    fav = Favorite(user_id=current_user.id, heritage_site_id=payload.heritage_site_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@router.get("/", response_model=List[FavoriteOut])
def list_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Favorite).filter(Favorite.user_id == current_user.id).all()


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    favorite_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fav = db.query(Favorite).filter(
        Favorite.id == favorite_id,
        Favorite.user_id == current_user.id,
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
