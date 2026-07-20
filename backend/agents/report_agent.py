import json
import logging
import os
from pathlib import Path
from typing import Any, Dict

from services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)


class ReportAgent:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client
        _base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.prompt_dir = Path(_base_dir) / "prompts" / "system"

    def _load_system_prompt(self) -> str:
        prompt_path = self.prompt_dir / "report.txt"
        if not prompt_path.exists():
            logger.error(f"System prompt not found at {prompt_path}")
            raise FileNotFoundError(f"System prompt not found: {prompt_path}")
        return prompt_path.read_text(encoding="utf-8").strip()

    def _build_prompt(self, prioritized_data: Dict[str, Any]) -> str:
        return f"""Generate an executive product discovery report based on the following prioritized themes:

{json.dumps(prioritized_data, indent=2)}

Provide a comprehensive, professional report structured exactly as JSON with the keys specified in the system instructions."""

    def _validate_response(self, response: Any) -> Dict[str, Any]:
        try:
            # If response is already a dict (parsed by GeminiClient)
            if isinstance(response, dict):
                data = response
            else:
                # Clean potential markdown or extra text
                response_text = str(response)
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0]
                data = json.loads(response_text.strip())

            # Ensure expected structure
            if "report" not in data:
                data = {"report": data}

            required_keys = [
                "executive_summary", "top_findings", "key_insights",
                "recommendations", "roadmap_now", "roadmap_next",
                "roadmap_later", "risks", "opportunities",
            ]
            for key in required_keys:
                if key not in data["report"]:
                    data["report"][key] = (
                        []
                        if key
                        in [
                            "top_findings",
                            "key_insights",
                            "recommendations",
                            "roadmap_now",
                            "roadmap_next",
                            "roadmap_later",
                            "risks",
                            "opportunities",
                        ]
                        else ""
                    )

            return data
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.error(f"Failed to validate Gemini response: {e}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")

    def run(self, prioritized_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info("ReportAgent: Starting report generation")

            system_prompt = self._load_system_prompt()
            user_prompt = self._build_prompt(prioritized_data)

            raw_response = self.gemini_client.generate(
                system_prompt=system_prompt, user_prompt=user_prompt
            )

            validated_report = self._validate_response(raw_response)

            logger.info("ReportAgent: Report generated successfully")
            return validated_report

        except Exception as e:
            logger.error(f"ReportAgent failed: {e}", exc_info=True)
            raise