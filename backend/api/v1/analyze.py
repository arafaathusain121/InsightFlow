import json
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["analyze"])

gemini = GeminiClient()

SYSTEM_PROMPT = """You are a product discovery analyst. Analyze the given customer feedback and return a JSON object with:
- "themes": a list of strings, each being a key theme identified in the feedback
- "priority": one of "High", "Medium", or "Low" based on the urgency/impact
- "summary": a concise 2-3 sentence executive summary of the feedback

Return ONLY valid JSON, no markdown, no extra text."""


class AnalyzeInput(BaseModel):
    feedback: str


class AnalyzeOutput(BaseModel):
    themes: list[str]
    priority: str
    summary: str


@router.post("/analyze", response_model=AnalyzeOutput)
async def analyze(request: AnalyzeInput):
    try:
        logger.info("Analyzing feedback")
        result = gemini.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=request.feedback,
        )
        return AnalyzeOutput(
            themes=result.get("themes", []),
            priority=result.get("priority", "Medium"),
            summary=result.get("summary", ""),
        )
    except Exception as e:
        logger.error(f"Analyze failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))