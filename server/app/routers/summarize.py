from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import SummarizeResponse
from pypdf import PdfReader
import io
import os
from openai import OpenAI

router = APIRouter(prefix="/summarize", tags=["Summarize"])

@router.post("/", response_model=SummarizeResponse)
async def summarize_document(file: UploadFile = File(...)):
    # 1. Extract Text from Uploaded PDF
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
             raise HTTPException(status_code=400, detail="PDF content is too short or unreadable.")
             
        # 2. Call LLM for Summarization (GrokAI)
        # Truncate text if too long (simple heuristic for now)
        truncated_text = text[:15000] # Grok has larger context window compared to standard small models
        
        client = OpenAI(
            api_key=os.getenv("XAI_API_KEY"),
            base_url="https://api.x.ai/v1"
        )
        prompt = f"""
        You are an expert Legal Summarizer.
        Summarize the following legal document into clear key points.
        Highlight the most critical obligations, penalties, or rights.
        
        Document Text:
        {truncated_text}
        """
        
        response = client.chat.completions.create(
            model="grok-2-latest",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        summary_text = response.choices[0].message.content
        
        # Simple heuristic to extract "key points" (e.g. split by newlines or bullets)
        key_points = [line.strip() for line in summary_text.split('\n') if line.strip().startswith('-') or line.strip().startswith('*')]
        
        return {
            "summary": summary_text,
            "key_points": key_points if key_points else ["See summary above."],
            "verdict": "Neutral analysis"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")
