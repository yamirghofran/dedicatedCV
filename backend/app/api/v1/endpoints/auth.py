"""
Authentication endpoints for user registration and login.
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import Token, User as UserSchema, UserCreate
from app.services.blob_service import get_blob_service

router = APIRouter()


@router.post(
    "/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    Args:
        user_in: User registration data (email, password, full_name)
        db: Database session

    Returns:
        User: The created user object

    Raises:
        HTTPException: If user with email already exists
    """
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    # Create new user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    OAuth2 compatible token login, get an access token for future requests.

    Args:
        db: Database session
        form_data: OAuth2 form with username (email) and password

    Returns:
        Token: Access token and token type

    Raises:
        HTTPException: If credentials are incorrect or user is inactive
    """
    # Authenticate user (username field contains email)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user.

    Args:
        current_user: The authenticated user from JWT token

    Returns:
        User: Current user object
    """
    return current_user


@router.post("/test-token", response_model=UserSchema)
def test_token(current_user: User = Depends(get_current_user)):
    """
    Test access token validity.

    Args:
        current_user: The authenticated user from JWT token

    Returns:
        User: Current user object if token is valid
    """
    return current_user


@router.post("/profile-picture", response_model=UserSchema)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a profile picture for the current user and return the updated user.
    """
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG or PNG images are supported",
        )

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty"
        )

    blob_service = get_blob_service()
    try:
        url, _ = blob_service.upload_profile_picture(
            user_id=current_user.id, data=data, filename=file.filename or "avatar"
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload profile picture",
        ) from exc

    current_user.profile_picture_url = url
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
