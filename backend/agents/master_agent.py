import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class MasterAgent:
    """Orchestrates the multi-agent pipeline for feedback analysis."""

    def __init__(
        self,
        ingestion_agent,
        extraction_agent,
        theme_agent,
        prioritization_agent,
        report_agent,
    ):
        self.ingestion_agent = ingestion_agent
        self.extraction_agent = extraction_agent
        self.theme_agent = theme_agent
        self.prioritization_agent = prioritization_agent
        self.report_agent = report_agent

    def run(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the full pipeline."""
        try:
            logger.info("MasterAgent: Starting pipeline")

            # Step 1: Ingest
            from schemas.request_models import AnalyzeRequest

            request = AnalyzeRequest(**request_data)
            cleaned = self.ingestion_agent.process(request)
            logger.info(f"MasterAgent: Ingestion complete — {len(cleaned.records)} records")

            # Step 2: Extract pain points
            pain_points = self.extraction_agent.run(cleaned)
            logger.info(f"MasterAgent: Extraction complete — {len(pain_points)} pain points")

            # Step 3: Group into themes
            themes = self.theme_agent.run(pain_points)
            logger.info(f"MasterAgent: Theming complete — {len(themes)} themes")

            # Step 4: Prioritize
            priorities = self.prioritization_agent.run(themes)
            logger.info("MasterAgent: Prioritization complete")

            # Step 5: Generate report
            report = self.report_agent.run(priorities)
            logger.info("MasterAgent: Report generation complete")

            return {
                "pain_points": pain_points,
                "themes": themes,
                "priorities": priorities,
                "report": report,
            }

        except Exception as e:
            logger.error(f"MasterAgent pipeline failed: {e}", exc_info=True)
            raise