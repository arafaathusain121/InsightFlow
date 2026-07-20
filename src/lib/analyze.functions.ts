import { z } from "zod";

const InputSchema = z.object({
  content: z.string().min(10).max(200_000),
  filename: z.string().optional(),
});

export type AnalysisResult = {
  summary: string;
  themes: Array<{ name: string; frequency: number; description: string }>;
  problems: Array<{
    title: string;
    description: string;
    impact: number; // 1-10
    effort: number; // 1-10
    priority: "critical" | "high" | "medium" | "low";
    affectedSegments: string[];
  }>;
  segments: Array<{ name: string; size: string; painPoints: string[] }>;
  quotes: Array<{ text: string; segment?: string; theme?: string }>;
  roadmap: Array<{ phase: string; timeframe: string; items: string[]; rationale: string }>;
};

const BACKEND_URL = "http://127.0.0.1:8001";

export async function runAnalysis(input: { data: { content: string; filename?: string } }): Promise<AnalysisResult> {
  const parsed = InputSchema.parse(input.data);

  // Truncate very long content to keep latency reasonable
  const content = parsed.content.length > 40_000 ? parsed.content.slice(0, 40_000) + "\n...[truncated]" : parsed.content;

  const res = await fetch(`${BACKEND_URL}/api/v1/analyze-full`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      filename: parsed.filename ?? null,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limited. Please retry in a moment.");
    throw new Error(`Analysis failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();

  return {
    summary: json.summary,
    themes: json.themes,
    problems: json.problems,
    segments: json.segments,
    quotes: json.quotes,
    roadmap: json.roadmap,
  };
}