import json
import logging
from typing import Any, Dict, List

from services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)


class ThemeAgent:
    """Groups extracted pain points into themes using Gemini."""

    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client
        self.prompt_dir = "prompts/system"

    def _load_system_prompt(self) -> str:
        import os
        prompt_path = os.path.join(self.prompt_dir, "theme.txt")
        if not os.path.exists(prompt_path):
            logger.error(f"System prompt not found at {prompt_path}")
            raise FileNotFoundError(f"System prompt not found: {prompt_path}")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()

    def _build_prompt(self, pain_points: List[Dict[str, Any]]) -> str:
        return json.dumps({"pain_points": pain_points}, indent=2)

    def run(self, pain_points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            logger.info("ThemeAgent: Starting theme grouping")
            system_prompt = self._load_system_prompt()
            user_prompt = self._build_prompt(pain_points)

            raw_response = self.gemini_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

            themes = raw_response.get("themes", [])
            logger.info(f"ThemeAgent: Identified {len(themes)} themes")
            return themes

        except Exception as e:
            logger.error(f"ThemeAgent failed: {e}", exc_info=True)
            raise