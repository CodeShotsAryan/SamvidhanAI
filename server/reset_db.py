from app.database import engine, Base
from app.models.user import User, PendingUser, PasswordReset

print("🧹 Resetting Database...")
Base.metadata.drop_all(bind=engine)
print("✅ Dropped old tables.")
Base.metadata.create_all(bind=engine)
print("✨ Created new tables.")
