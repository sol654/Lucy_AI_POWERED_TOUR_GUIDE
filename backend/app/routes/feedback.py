from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fb = Feedback(user_id=current_user.id, message=payload.message, rating=payload.rating)
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb
