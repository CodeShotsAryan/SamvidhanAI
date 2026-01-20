import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import time

load_dotenv()

# Use the same logic as app/database.py for consistency
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )


def migrate():
    print(f"🔄 Running migration: Adding related_cases to messages table...")

    max_retries = 5
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            # Create engine with a shorter connect timeout for faster retries
            engine = create_engine(
                SQLALCHEMY_DATABASE_URL,
                connect_args={"connect_timeout": 5}
                if "postgresql" in SQLALCHEMY_DATABASE_URL
                else {},
            )
            with engine.connect() as connection:
                connection.execute(
                    text("""
                    ALTER TABLE messages 
                    ADD COLUMN IF NOT EXISTS related_cases JSON;
                """)
                )
                connection.commit()
            print("✅ Migration successful!")
            return
        except Exception as e:
            print(f"⚠️ Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"🕒 Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("❌ Migration failed after multiple attempts.")


if __name__ == "__main__":
    migrate()
