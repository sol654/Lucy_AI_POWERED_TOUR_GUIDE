from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, UserUpdate, ChangePassword, ForgotPassword
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    if db.query(User).filter(User.email == normalized_email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name.strip(),
        email=normalized_email,
        password_hash=hash_password(payload.password),
        language_preference=payload.language_preference or "en",
        security_question=payload.security_question.strip(),
        security_answer_hash=hash_password(payload.security_answer.strip().lower()),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserOut.from_orm(user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserOut.from_orm(user))


@router.get("/profile", response_model=UserOut)
def profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.language_preference is not None:
        current_user.language_preference = payload.language_preference
    if payload.name is not None:
        current_user.name = payload.name
    if payload.profile_picture_url is not None:
        current_user.profile_picture_url = payload.profile_picture_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def change_password(
    payload: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPassword, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(payload.security_answer.strip().lower(), user.security_answer_hash):
        raise HTTPException(status_code=400, detail="Security answer is incorrect")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}
