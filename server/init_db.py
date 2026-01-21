import sys
import os
from app.database import engine, Base
from app.models.user import User
from app.models.conversation import Conversation, Message, LegalDomain


def init_db():
    print("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    init_db()
