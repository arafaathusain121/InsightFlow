from pydantic import BaseModel, Field
from typing import List


class PainPoint(BaseModel):
    title: str = Field(..., description="Clear, actionable pain point title")
    description: str = Field(..., description="Detailed description with evidence")
    frequency: int = Field(..., description="Number of times this pain was mentioned")


class Theme(BaseModel):
    name: str = Field(..., description="Theme name")
    count: int = Field(..., description="Number of insights in this theme")


class Priority(BaseModel):
    theme: str = Field(..., description="Theme name")
    impact: int = Field(..., ge=1, le=10, description="Business impact score 1-10")
    effort: str = Field(..., description="Effort level: Low, Medium, High")
    priority: int = Field(..., ge=1, le=10, description="Overall priority score")


class ExecutiveReport(BaseModel):
    summary: str = Field(..., description="Executive summary")
    recommendations: List[str] = Field(..., description="Key recommendations")
    roadmap_now: List[str] = Field(..., description="Immediate actions")
    roadmap_next: List[str] = Field(..., description="Next quarter focus")
    roadmap_later: List[str] = Field(..., description="Long-term bets")


class AnalyzeResponse(BaseModel):
    model_config = {"extra": "forbid"}

    pain_points: List[PainPoint] = Field(..., description="Extracted pain points")
    themes: List[Theme] = Field(..., description="Identified themes")
    priorities: List[Priority] = Field(..., description="Prioritized themes")
    report: ExecutiveReport = Field(..., description="Executive level report")