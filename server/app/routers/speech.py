from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from ..services.sarvam_service import sarvam_service
import base64

router = APIRouter(
    prefix="/api/speech",
    tags=["Speech"],
)

class TTSRequest(BaseModel):
    text: str

@router.post("/process-tts")
async def process_tts(request: TTSRequest):
    try:
        audio_base64 = sarvam_service.text_to_speech(request.text)
        if not audio_base64:
            raise HTTPException(status_code=500, detail="Failed to generate speech")
        return {"audio": audio_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-stt")
async def process_stt(file: UploadFile = File(...)):
    try:
        content = await file.read()
        transcript = sarvam_service.speech_to_text(content)
        if not transcript:
            raise HTTPException(status_code=500, detail="Failed to transcribe audio")
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
