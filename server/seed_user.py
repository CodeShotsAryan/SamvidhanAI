from app.database import SessionLocal
from app.models.user import User
from app.auth_utils import get_password_hash

def create_user():
    db = SessionLocal()
    email = "aryancse1@gmail.com"
    username = "aryancse1"
    password = "password123"
    full_name = "Aryan CSE"

    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"User {email} already exists.")
        db.close()
        return

    hashed_password = get_password_hash(password)
    user = User(
        username=username,
        email=email,
        full_name=full_name,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"User created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    db.close()

if __name__ == "__main__":
    create_user()
