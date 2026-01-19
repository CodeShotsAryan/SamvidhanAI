from fastapi import APIRouter
from app.models.schemas import SearchRequest, SearchResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("/", response_model=SearchResponse)
async def search_legal_code(request: SearchRequest):
    # 1. Retrieve relevant chunks from ChromaDB
    context = rag_service.retrieve_context(
        query=request.query, 
        domain=request.domain
    )
    
    # 2. Generate Answer using LLM
    final_answer = rag_service.generate_answer(
        query=request.query, 
        context=context
    )
    
    # 3. Format Citations for Frontend
    formatted_citations = []
    for item in context:
        meta = item['metadata']
        formatted_citations.append({
            "act": meta.get("act", "Unknown"),
            "section": meta.get("section", "N/A"),
            "text": item.get("text", ""),
            "source_link": f"http://official-site.com/{meta.get('act', '').replace(' ', '_')}" # Placeholder link logic
        })
    
    return {
        "answer": final_answer,
        "citations": formatted_citations,
        "related_cases": [], # Future: Connect to Case Law DB
        "legal_domain_detected": request.domain or "GENERAL"
    }
