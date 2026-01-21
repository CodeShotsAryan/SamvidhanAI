import requests
import os


class SarvamService:
    def __init__(self):
        self.api_key = os.getenv("SARVAM_API_KEY")
        self.base_url = "https://api.sarvam.ai"

    def text_to_speech(self, text: str):
        url = f"{self.base_url}/text-to-speech"
        payload = {
            "inputs": [text],
            "target_language_code": "hi-IN",
            "speaker": "anushka",
            "pitch": 0,
            "pace": 1.0,
            "loudness": 1.5,
            "speech_sample_rate": 8000,
            "enable_preprocessing": True,
            "model": "bulbul:v2",
        }
        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": self.api_key,
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()

            # Check if audios exists
            data = response.json()
            if "audios" in data and len(data["audios"]) > 0:
                return data["audios"][0]
            else:
                return None

        except Exception:
            return None

    def speech_to_text(self, audio_file_content):
        url = f"{self.base_url}/speech-to-text"

        # Determine if it's a file path or bytes. Assuming bytes from UploadFile
        files = {"file": ("audio.webm", audio_file_content, "audio/webm")}
        data = {"model": "saarika:v2.5"}
        headers = {"api-subscription-key": self.api_key}

        try:
            response = requests.post(url, files=files, data=data, headers=headers)
            response.raise_for_status()
            return response.json()["transcript"]
        except Exception:
            return None


sarvam_service = SarvamService()
