import json
import logging
from typing import Any

from google import genai
from google.genai import types

from config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class GeminiClient:
    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-2.5-flash"

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
    ) -> dict[str, Any]:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=temperature,
                    response_mime_type="application/json",
                ),
                contents=user_prompt,
            )
            return json.loads(response.text.strip())
        except json.JSONDecodeError:
            logger.exception("Invalid JSON received from Gemini.")
            raise ValueError("Gemini returned invalid JSON.")
        except Exception as e:
            logger.exception("Gemini API Error")
            raise RuntimeError(str(e))