from fastapi import APIRouter
from app.models.schemas import SummarizeRequest, SummarizeResponse

router = APIRouter(prefix="/summarize", tags=["Summarize"])

@router.post("/", response_model=SummarizeResponse)
async def summarize_document(request: SummarizeRequest):
    return {
        "summary": "Summary placeholder.",
        "key_points": ["Point 1", "Point 2"],
        "verdict": "Allowed"
    }
