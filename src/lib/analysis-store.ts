import type { AnalysisResult } from "./analyze.functions";

const KEY = "insightflow:last-analysis";

export type StoredAnalysis = {
  filename: string;
  createdAt: string;
  charCount: number;
  result: AnalysisResult;
};

export function saveAnalysis(data: StoredAnalysis) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadAnalysis(): StoredAnalysis | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAnalysis;
  } catch {
    return null;
  }
}

export function clearAnalysis() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}