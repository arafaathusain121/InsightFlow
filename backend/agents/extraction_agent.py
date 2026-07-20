import json
import logging
from typing import Any, Dict, List

from services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)


class ExtractionAgent:
    """Extracts pain points from customer feedback using Gemini."""

    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client
        self.prompt_dir = "prompts/system"

    def _load_system_prompt(self) -> str:
        import os
        prompt_path = os.path.join(self.prompt_dir, "extraction.txt")
        if not os.path.exists(prompt_path):
            logger.error(f"System prompt not found at {prompt_path}")
            raise FileNotFoundError(f"System prompt not found: {prompt_path}")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()

    def _build_prompt(self, cleaned_data) -> str:
        records = []
        for record in cleaned_data.records:
            records.append({
                "id": record.id,
                "text": record.text,
                "source": record.source,
                "user_segment": record.user_segment,
            })
        return json.dumps({"records": records}, indent=2)

    def run(self, cleaned_data) -> List[Dict[str, Any]]:
        try:
            logger.info("ExtractionAgent: Starting pain point extraction")
            system_prompt = self._load_system_prompt()
            user_prompt = self._build_prompt(cleaned_data)

            raw_response = self.gemini_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

            pain_points = raw_response.get("pain_points", [])
            logger.info(f"ExtractionAgent: Extracted {len(pain_points)} pain points")
            return pain_points

        except Exception as e:
            logger.error(f"ExtractionAgent failed: {e}", exc_info=True)
            raise