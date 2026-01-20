"""
Seed script to populate legal domains in the database
Run this once after creating the database tables
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User  # Import to register the model
from app.models.conversation import Conversation, Message, LegalDomain
from app.database import Base

# Use localhost for local execution, postgres for Docker
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://admin:admin@localhost:5432/samvidhan_db"
)
if "postgres:" in DATABASE_URL:
    # Running locally, replace postgres with localhost
    DATABASE_URL = DATABASE_URL.replace("@postgres:", "@localhost:")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)


def seed_legal_domains():
    db = SessionLocal()

    # Check if domains already exist
    existing = db.query(LegalDomain).first()
    if existing:
        print("Legal domains already seeded!")
        db.close()
        return

    domains = [
        {
            "name": "Criminal Law",
            "description": "IPC, BNS, and criminal procedure codes",
            "icon": "Gavel",
        },
        {
            "name": "Corporate & Commercial Law",
            "description": "Companies Act, contracts, and business regulations",
            "icon": "Building2",
        },
        {
            "name": "Cyber & IT Law",
            "description": "Information Technology Act and cyber regulations",
            "icon": "Globe",
        },
        {
            "name": "Constitutional Law",
            "description": "Indian Constitution and fundamental rights",
            "icon": "Book",
        },
        {
            "name": "Civil Law",
            "description": "Civil procedure, property, and family law",
            "icon": "Scale",
        },
        {
            "name": "Environmental Law",
            "description": "Environmental protection and regulations",
            "icon": "Globe",
        },
        {
            "name": "Labour & Employment Law",
            "description": "Labor laws, employment rights, and workplace regulations",
            "icon": "Briefcase",
        },
        {
            "name": "Taxation Law",
            "description": "Income tax, GST, and tax regulations",
            "icon": "FileText",
        },
    ]

    for domain_data in domains:
        domain = LegalDomain(**domain_data)
        db.add(domain)

    db.commit()
    print(f"✅ Successfully seeded {len(domains)} legal domains!")
    db.close()


if __name__ == "__main__":
    seed_legal_domains()
