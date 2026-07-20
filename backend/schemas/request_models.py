from pydantic import BaseModel, Field
from typing import List, Optional


class FeedbackRecord(BaseModel):
    id: str = Field(..., description="Unique identifier for the record")
    text: str = Field(..., description="Customer feedback text / transcript / survey response")
    source: Optional[str] = Field(None, description="Source of the feedback (interview, survey, ticket, etc.)")
    user_segment: Optional[str] = Field(None, description="User segment (e.g., SMB Founder, Enterprise Admin)")


class AnalyzeRequest(BaseModel):
    model_config = {"extra": "forbid"}

    records: List[FeedbackRecord] = Field(..., description="List of customer feedback records to analyze")