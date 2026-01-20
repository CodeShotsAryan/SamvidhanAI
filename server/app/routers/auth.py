from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from ..database import get_db
from ..models.user import User, PendingUser, PasswordReset
from ..auth_utils import get_password_hash, verify_password, create_access_token
from ..email_utils import send_otp_email, generate_otp
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str


class LoginRequest(BaseModel):
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None

    class Config:
        orm_mode = True




@router.post("/register")
async def register(
    user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    db.query(PendingUser).filter(PendingUser.email == user.email).delete()
    db.query(PendingUser).filter(PendingUser.username == user.username).delete()

    hashed_pwd = get_password_hash(user.password)
    otp_val = generate_otp()

    new_pending = PendingUser(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_pwd,
        otp_code=otp_val,
        expires_at=datetime.utcnow() + timedelta(minutes=3),
    )
    db.add(new_pending)
    db.commit()

    print(f"DEBUG: OTP for {user.email} is {otp_val}")
    background_tasks.add_task(send_otp_email, user.email, otp_val)
    return {"message": "Verification code sent to email. Valid for 3 minutes."}


@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    pending = (
        db.query(PendingUser)
        .filter(PendingUser.email == data.email, PendingUser.otp_code == data.otp_code)
        .first()
    )

    if not pending:
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    if pending.expires_at < datetime.utcnow():
        db.delete(pending)
        db.commit()
        raise HTTPException(
            status_code=400, detail="OTP expired. Please register again."
        )

    new_user = User(
        username=pending.username,
        email=pending.email,
        full_name=pending.full_name,
        hashed_password=pending.hashed_password,
    )
    db.add(new_user)
    db.delete(pending)
    db.commit()
    return {"message": "Registration successful!", "status": "success"}


@router.post("/verify-email")
def verify_email(data: OTPVerify, db: Session = Depends(get_db)):
    return verify_otp(data, db)


class ResendVerification(BaseModel):
    email: EmailStr


@router.post("/resend-verification")
async def resend_verification(
    data: ResendVerification,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    pending = db.query(PendingUser).filter(PendingUser.email == data.email).first()

    if not pending:
        raise HTTPException(
            status_code=404, detail="No pending registration found for this email"
        )

    otp_val = generate_otp()
    pending.otp_code = otp_val
    pending.expires_at = datetime.utcnow() + timedelta(minutes=3)
    db.commit()

    print(f"DEBUG: New OTP for {data.email} is {otp_val}")
    background_tasks.add_task(send_otp_email, data.email, otp_val)
    return {"message": "New verification code sent to email"}


@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        data = await request.json()
        username = data.get("username")
        password = data.get("password")
    else:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    pending = (
        db.query(PendingUser)
        .filter((PendingUser.username == username) | (PendingUser.email == username))
        .first()
    )

    if pending:
        raise HTTPException(
            status_code=403,
            detail="Your email is not verified yet. Please check your email inbox for the verification code and complete the verification process before logging in.",
        )

    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = db.query(User).filter(User.email == username).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username})
    return {"token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import jwt, JWTError
    from ..auth_utils import SECRET_KEY, ALGORITHM

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)

    user = db.query(User).filter(User.username == username).first()
    return user


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(PasswordReset).filter(PasswordReset.email == data.email).delete()

    otp_val = generate_otp()
    reset_entry = PasswordReset(
        email=data.email,
        otp_code=otp_val,
        expires_at=datetime.utcnow() + timedelta(minutes=5),
    )
    db.add(reset_entry)
    db.commit()

    background_tasks.add_task(send_otp_email, data.email, otp_val)
    return {"message": "Password reset code sent to email."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_record = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.email == data.email, PasswordReset.otp_code == data.otp_code
        )
        .first()
    )

    if not reset_record or reset_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")

    user = db.query(User).filter(User.email == data.email).first()
    if user:
        user.hashed_password = get_password_hash(data.new_password)
        db.delete(reset_record)
        db.commit()
        return {"message": "Password reset successfully!"}

    raise HTTPException(status_code=404, detail="User not found")
