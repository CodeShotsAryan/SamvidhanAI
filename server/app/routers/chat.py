from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..services.rag_service import rag_service
from ..models.user import User
from ..routers.conversations import get_current_user

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: int
    domain: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: Optional[list] = None
    citations: Optional[list] = None
    comparison: Optional[dict] = None


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session_id = f"conv_{request.conversation_id}"

    context = rag_service.retrieve_context(
        query=request.message, domain=request.domain, n_results=3
    )

    answer_dict = rag_service.generate_answer(
        query=request.message,
        context=context,
        session_id=session_id,
        domain=request.domain,
    )

    import json

    citations = answer_dict.get("citations", [])

    # Remove citations from answer_dict before serializing to response string if present
    # but the frontend parses this JSON string, so keeping them there is also fine.
    # We will pass them explicitly in the response as well for easier access.

    response_json_str = json.dumps(answer_dict)

    return {
        "response": response_json_str,
        "sources": [],  # Removing sources as requested
        "citations": citations,
    }
