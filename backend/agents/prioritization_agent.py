import json
import logging
from typing import Any, Dict, List

from services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)


class PrioritizationAgent:
    """Prioritizes themes based on impact and effort using Gemini."""

    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client
        self.prompt_dir = "prompts/system"

    def _load_system_prompt(self) -> str:
        import os
        prompt_path = os.path.join(self.prompt_dir, "priority.txt")
        if not os.path.exists(prompt_path):
            logger.error(f"System prompt not found at {prompt_path}")
            raise FileNotFoundError(f"System prompt not found: {prompt_path}")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()

    def _build_prompt(self, themes: List[Dict[str, Any]]) -> str:
        return json.dumps({"themes": themes}, indent=2)

    def run(self, themes: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            logger.info("PrioritizationAgent: Starting prioritization")
            system_prompt = self._load_system_prompt()
            user_prompt = self._build_prompt(themes)

            raw_response = self.gemini_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

            logger.info("PrioritizationAgent: Prioritization complete")
            return raw_response

        except Exception as e:
            logger.error(f"PrioritizationAgent failed: {e}", exc_info=True)
            raise