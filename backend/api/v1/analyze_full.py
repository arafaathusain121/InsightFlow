import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["analyze"])

gemini = GeminiClient()

SYSTEM_PROMPT = """You are InsightFlow, a senior product-research AI that runs a 5-agent pipeline (Ingestion → Extraction → Theming → Prioritization → Reporting) over raw customer feedback.

Given raw feedback (interviews, surveys, support tickets, CSV rows, JSON), you MUST output ONE JSON object matching this exact shape (no prose, no code fences):

{
  "summary": string (2-3 sentences),
  "themes": [{ "name": string, "frequency": number (1-100 relative %), "description": string }] (4-7 items),
  "problems": [{ "title": string, "description": string, "impact": 1-10, "effort": 1-10, "priority": "critical"|"high"|"medium"|"low", "affectedSegments": string[] }] (4-8 items),
  "segments": [{ "name": string, "size": string (e.g. "~40%"), "painPoints": string[] }] (2-5 items),
  "quotes": [{ "text": string, "segment"?: string, "theme"?: string }] (4-8 items, verbatim or lightly cleaned excerpts from the input),
  "roadmap": [{ "phase": "Now"|"Next"|"Later", "timeframe": string, "items": string[], "rationale": string }] (exactly 3 items: Now/Next/Later)
}

Rules:
- Ground everything in the provided text; do not invent facts.
- Prioritization uses impact vs effort; critical = high impact + urgent segment reach.
- Quotes must be short (< 200 chars) and traceable to the input.
- Return only the JSON object."""


class AnalyzeFullInput(BaseModel):
    content: str
    filename: str | None = None


class AnalyzeFullOutput(BaseModel):
    summary: str
    themes: list[dict[str, Any]]
    problems: list[dict[str, Any]]
    segments: list[dict[str, Any]]
    quotes: list[dict[str, Any]]
    roadmap: list[dict[str, Any]]


@router.post("/analyze-full", response_model=AnalyzeFullOutput)
async def analyze_full(request: AnalyzeFullInput):
    try:
        logger.info("Analyzing feedback with full pipeline")

        # Truncate very long content to keep latency reasonable
        content = request.content
        if len(content) > 40_000:
            content = content[:40_000] + "\n...[truncated]"

        user_prompt = f"Source: {request.filename or 'uploaded_feedback'}\n\n--- RAW FEEDBACK ---\n{content}"

        result = gemini.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

        return AnalyzeFullOutput(
            summary=result.get("summary", ""),
            themes=result.get("themes", []),
            problems=result.get("problems", []),
            segments=result.get("segments", []),
            quotes=result.get("quotes", []),
            roadmap=result.get("roadmap", []),
        )
    except Exception as e:
        logger.error(f"Analyze full failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))