from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.pdf_service import process_pdf_document
from app.models.user import User
from app.routers.conversations import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/api/summarize", tags=["summarize"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_and_summarize(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Upload a PDF legal document and get a structured summary
    """

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Read file content
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE / (1024 * 1024)}MB",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        # Process PDF and generate summary
        result = process_pdf_document(content)

        return {
            "success": True,
            "filename": file.filename,
            "summary": result["summary"],
            "text_length": result["extracted_text_length"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
