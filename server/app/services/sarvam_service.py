import requests
import os
import base64

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
            "model": "bulbul:v2"
        }
        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": self.api_key
        }

        try:
            print(f"Sending TTS request to {url} with payload: {payload} and key {self.api_key[:5]}...")
            response = requests.post(url, json=payload, headers=headers)
            print(f"Sarvam TTS Response Status: {response.status_code}")
            if response.status_code != 200:
                print(f"Error Content: {response.text}")
            response.raise_for_status()
            
            # Check if audios exists
            data = response.json()
            if "audios" in data and len(data["audios"]) > 0:
                print("TTS Audio generated successfully")
                return data["audios"][0]
            else:
                print(f"Unexpected response format: {data}")
                return None
                
        except Exception as e:
            print(f"Error in TTS: {e}")
            return None

    def speech_to_text(self, audio_file_content):
        url = f"{self.base_url}/speech-to-text-translate"
        
        # Determine if it's a file path or bytes. Assuming bytes from UploadFile
        files = {
            'file': ('audio.webm', audio_file_content, 'audio/webm')
        }
        data = {
            "model": "saaras:v2.5"
        }
        headers = {
            "api-subscription-key": self.api_key
        }

        try:
            print(f"Sending STT request to {url}")
            response = requests.post(url, files=files, data=data, headers=headers)
            print(f"Sarvam STT Response Status: {response.status_code}")
            if response.status_code != 200:
                 print(f"Error Content: {response.text}")
            response.raise_for_status()
            return response.json()["transcript"]
        except Exception as e:
            print(f"Error in STT: {e}")
            return None

sarvam_service = SarvamService()
