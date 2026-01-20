from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Conversation(Base):
    """Stores chat conversations for each user"""

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(255), nullable=False)  # Auto-generated from first message
    domain_filter = Column(
        String(100), nullable=True
    )  # e.g., "Criminal Law", "Corporate Law"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships - use string reference to avoid circular imports
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )
    # Don't define backref here, let User model handle it if needed


class Message(Base):
    """Stores individual messages within a conversation"""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)  # The actual message text
    sources = Column(JSON, nullable=True)  # Stores citations/sources as JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


class LegalDomain(Base):
    """Stores available legal domains for filtering"""

    __tablename__ = "legal_domains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # e.g., "Criminal Law"
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Icon name for frontend
    created_at = Column(DateTime(timezone=True), server_default=func.now())
