import os
import logging
from sarvamai import SarvamAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IndicASR:
    def __init__(self):
        api_key = os.environ.get('SARVAM_API_KEY', 'sk_3m9fepx9_bPUfREeQoaYYwGYrVwLDWwWI')
        
        if not api_key:
            logger.warning("SARVAM_API_KEY not set. ASR will not be available.")
            logger.warning("Get your API key from: https://www.sarvam.ai/apis")
            self.client = None
        else:
            try:
                self.client = SarvamAI(api_subscription_key=api_key)
                logger.info("Sarvam AI ASR initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Sarvam AI: {e}")
                self.client = None

    def transcribe(self, audio_path, language_code='hi'):
        """
        Transcribe audio file to text using Sarvam AI.
        language_code: 'hi-IN' for Hindi, 'en-US' for English, etc.
        """
        if not self.client:
            logger.error("Sarvam AI client not initialized. Please set SARVAM_API_KEY.")
            return None

        try:
            logger.info(f"Transcribing audio with Sarvam AI (language: {language_code})")
            
            # Sarvam AI STT with translation to English
            with open(audio_path, 'rb') as audio_file:
                response = self.client.speech_to_text.translate(
                    file=audio_file,
                    model="saaras:v2.5"
                )
            
            # Extract transcription from response
            transcription = response.transcript if hasattr(response, 'transcript') else str(response)
            logger.info(f"Transcription: {transcription}")
            return transcription
            
        except Exception as e:
            logger.error(f"Error during Sarvam AI transcription: {e}")
            return None
