from app.services.sarvam_service import SarvamService
import os
from dotenv import load_dotenv

load_dotenv()

def test_tts():
    service = SarvamService()
    print("Testing TTS...")
    audio = service.text_to_speech("Namaste, this is a test audio.")
    if audio:
        print("TTS Success! Audio length:", len(audio))
    else:
        print("TTS Failed.")

if __name__ == "__main__":
    test_tts()
