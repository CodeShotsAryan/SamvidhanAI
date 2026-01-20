from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.user import User
from ..models.conversation import Conversation, Message, LegalDomain
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from ..auth_utils import SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/api/conversations",
    tags=["Conversations"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class MessageCreate(BaseModel):
    role: str
    content: str
    sources: Optional[List[dict]] = None
    citations: Optional[List[dict]] = None
    related_cases: Optional[List[str]] = None


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: Optional[List[dict]] = None
    citations: Optional[List[dict]] = None
    related_cases: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: str
    domain_filter: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    title: str
    domain_filter: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ConversationWithMessages(BaseModel):
    id: int
    title: str
    domain_filter: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse]

    class Config:
        from_attributes = True


class LegalDomainResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

    class Config:
        from_attributes = True


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("", response_model=List[ConversationResponse])
def get_user_conversations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    result = []
    for conv in conversations:
        conv_dict = {
            "id": conv.id,
            "title": conv.title,
            "domain_filter": conv.domain_filter,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "message_count": len(conv.messages),
        }
        result.append(conv_dict)

    return result


@router.post("", response_model=ConversationResponse)
def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_conversation = Conversation(
        user_id=current_user.id,
        title=conversation.title,
        domain_filter=conversation.domain_filter,
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    return {
        "id": new_conversation.id,
        "title": new_conversation.title,
        "domain_filter": new_conversation.domain_filter,
        "created_at": new_conversation.created_at,
        "updated_at": new_conversation.updated_at,
        "message_count": 0,
    }


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id, Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
def add_message(
    conversation_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id, Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    new_message = Message(
        conversation_id=conversation_id,
        role=message.role,
        content=message.content,
        sources=message.sources,
        citations=message.citations,
        related_cases=message.related_cases,
    )
    db.add(new_message)

    conversation.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(new_message)

    return new_message


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id, Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()

    return {"message": "Conversation deleted successfully"}


@router.get("/domains/list", response_model=List[LegalDomainResponse])
def get_legal_domains(db: Session = Depends(get_db)):
    domains = db.query(LegalDomain).all()
    return domains
