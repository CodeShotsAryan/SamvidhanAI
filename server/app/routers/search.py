from fastapi import APIRouter
from app.models.schemas import SearchRequest, SearchResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("/", response_model=SearchResponse)
async def search_legal_code(request: SearchRequest):
    # 1. Retrieve relevant chunks from ChromaDB
    context = rag_service.retrieve_context(query=request.query, domain=request.domain)

    # 2. Generate Answer using LLM (Returns Dict now)
    answer_dict = rag_service.generate_answer(query=request.query, context=context)

    # 3. Feature 3: Automated Case Law Cross-Referencing
    related_cases_list = rag_service.find_related_cases(request.query)

    # 4. Format Citations
    formatted_citations = []
    for item in context:
        meta = item["metadata"]
        formatted_citations.append(
            {
                "id": f"{meta.get('act')}_{meta.get('section')}",
                "source": meta.get("act", "Unknown"),
                "section": meta.get("section", "N/A"),
                "text": item.get("text", "")[:200] + "...",  # Truncate for display
                "url": f"https://indiankanoon.org/search/?formInput={meta.get('act', '').replace(' ', '+')}",
            }
        )

    return {
        "structured_answer": {
            "green_layer": answer_dict.get("green_layer", ""),
            "yellow_layer": answer_dict.get("yellow_layer", ""),
            "red_layer": answer_dict.get("red_layer", ""),
        },
        "citations": formatted_citations,
        "related_cases": related_cases_list,
        "legal_domain_detected": request.domain or "GENERAL",
    }
