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
    sources: list
    comparison: Optional[dict] = None


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Chat endpoint that uses RAG to generate responses
    """
    # Use conversation_id as session_id for chat history
    session_id = f"conv_{request.conversation_id}"

    # Retrieve context from Pinecone
    context = rag_service.retrieve_context(
        query=request.message, domain=request.domain, n_results=3
    )

    # Format sources for reference
    sources = []
    for item in context:
        meta = item["metadata"]
        sources.append(
            {
                "act": meta.get("act", "Unknown"),
                "section": meta.get("section", "N/A"),
                "text": item.get("text", "")[:200] + "...",
            }
        )

    # Generate answer using Groq LLM with chat history and domain filter
    answer_dict = rag_service.generate_answer(
        query=request.message,
        context=context,
        session_id=session_id,
        domain=request.domain,
    )

    # Return the structured JSON from Groq as a string in the 'response' field.
    # The frontend is already designed to JSON.parse(m.content) and show the layers.
    import json

    response_json_str = json.dumps(answer_dict)

    return {"response": response_json_str, "sources": sources}
