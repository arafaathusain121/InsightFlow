from schemas.request_models import AnalyzeRequest, FeedbackRecord
import logging
from typing import List
import hashlib

logger = logging.getLogger(__name__)


class IngestionAgent:
    """First agent in the pipeline. Cleans and deduplicates incoming feedback."""

    def process(self, request: AnalyzeRequest) -> AnalyzeRequest:
        """Process and clean the request without mutating original."""
        if not request.records:
            raise ValueError("No records provided for analysis")

        cleaned_records: List[FeedbackRecord] = []
        seen = set()

        for record in request.records:
            if not record.text or not record.text.strip():
                continue

            cleaned_text = self._clean_text(record.text)

            # Deduplication using hash of cleaned text
            text_hash = hashlib.md5(cleaned_text.encode()).hexdigest()
            if text_hash in seen:
                continue
            seen.add(text_hash)

            cleaned_records.append(
                FeedbackRecord(
                    id=record.id,
                    text=cleaned_text,
                    source=record.source,
                    user_segment=record.user_segment,
                )
            )

        if not cleaned_records:
            raise ValueError("No valid records after cleaning and deduplication")

        logger.info(f"IngestionAgent: Processed {len(request.records)} → {len(cleaned_records)} valid records")

        return AnalyzeRequest(records=cleaned_records)

    def _clean_text(self, text: str) -> str:
        """Clean text: strip, normalize spaces."""
        return " ".join(text.strip().split())