from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import SummarizeResponse
from pypdf import PdfReader
import io
import os
from openai import OpenAI

router = APIRouter(prefix="/api/summarize", tags=["Summarize"])


@router.post("/", response_model=SummarizeResponse)
async def summarize_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
        pdf_stream = io.BytesIO(content)
        reader = PdfReader(pdf_stream)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"

        if len(text) < 50:
            raise HTTPException(
                status_code=400, detail="PDF content is too short or unreadable."
            )

        truncated_text = text[:15000]

        client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        summary_text = response.choices[0].message.content

        key_points = [
            line.strip()
            for line in summary_text.split("\n")
            if line.strip().startswith("-") or line.strip().startswith("*")
        ]

        return {
            "summary": summary_text,
            "key_points": key_points if key_points else ["See summary above."],
            "verdict": "Neutral analysis",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")
