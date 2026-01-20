"""
Database migration script to add citations column to messages table.
Run this script once to update your existing database schema.
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add parent directory to path to import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment variables")
    sys.exit(1)

print("Connecting to database...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        # Check if citations column already exists
        result = connection.execute(
            text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='messages' AND column_name='citations'
        """)
        )

        if result.fetchone():
            print("✓ Citations column already exists. No migration needed.")
        else:
            # Add citations column
            print("Adding citations column to messages table...")
            connection.execute(
                text("""
                ALTER TABLE messages 
                ADD COLUMN citations JSON NULL
            """)
            )
            connection.commit()
            print("✓ Successfully added citations column to messages table")

except Exception as e:
    print(f"✗ Error during migration: {e}")
    sys.exit(1)

print("\n✓ Migration completed successfully!")
print("You can now restart your application with docker-compose.")
