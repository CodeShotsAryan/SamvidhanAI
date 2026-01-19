from fastapi import APIRouter
from app.models.schemas import CompareRequest, CompareResponse

router = APIRouter(prefix="/compare", tags=["Compare"])

@router.post("/", response_model=CompareResponse)
async def compare_laws(request: CompareRequest):
    return {
        "comparison_text": "Comparison placeholder.",
        "key_changes": ["Change 1", "Change 2"]
    }
