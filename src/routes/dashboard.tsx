import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { FileUp, Play, X, FileText, Zap } from "lucide-react";
import { Nav } from "../components/insightflow/Nav";
import {
  AgentFlow,
  DEFAULT_AGENTS,
  type AgentStep,
} from "../components/insightflow/AgentFlow";
import { runAnalysis } from "../lib/analyze.functions";
import { saveAnalysis } from "../lib/analysis-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — InsightFlow" },
      {
        name: "description",
        content: "Upload customer feedback and watch the multi-agent AI pipeline synthesize a roadmap.",
      },
    ],
  }),
  component: Dashboard,
});

const SAMPLE = `# Interview — Sarah, VP Ops (Enterprise, 500 seats)
"Onboarding new team members takes us 3–4 days. Every new hire needs someone to walk them through the workspace setup. If invites could preload templates, we'd save half a week per hire."

# Interview — Marco, Solo consultant
"I love the reports, but exporting to PDF drops all my charts. I ended up screenshotting each one. It's the single reason I almost churned last month."

# Support ticket #4821 — SMB customer
Subject: Slow dashboard
"Dashboard takes 12 seconds to load once I cross ~10k records. This started around Feb. Please prioritize."

# Support ticket #4922 — Enterprise
Subject: SSO with Okta
"We can't roll out to legal & finance without SAML. Currently blocked. Timeline?"

# Survey response — Freelancer segment
"Pricing per seat doesn't make sense for me — I'm solo. A usage-based tier would win me back."

# Survey response — Enterprise admin
"Audit log is missing user-agent + IP. Our security team flagged it during renewal."

# Interview — Priya, Product manager (SMB)
"The Slack integration is 10x more useful than the email digest. But it only supports one channel per workspace."

# Support ticket #5001
"CSV import errors out on files > 20MB with no message. Have to split manually."

# Survey — NPS 4
"Great core product but reporting is where we drop off. Charts are pretty but I can't customize the axes."

# Interview — Enterprise IT
"We need role-based permissions with at least four tiers. Right now it's admin/member and that's a dealbreaker for compliance."`;

const ACCEPTED = [".txt", ".csv", ".json", ".md", ".log"];

function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState<{ name: string; content: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [agents, setAgents] = useState<AgentStep[]>(DEFAULT_AGENTS);
  const [isRunning, setIsRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleFile = useCallback((f: File) => {
    const name = f.name.toLowerCase();
    const ok = ACCEPTED.some((ext) => name.endsWith(ext));
    if (!ok) {
      toast.error("Unsupported file", {
        description: `Please upload one of: ${ACCEPTED.join(", ")}`,
      });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Max 5 MB for the demo." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      setFile({ name: f.name, content });
      toast.success("File loaded", { description: `${f.name} · ${content.length.toLocaleString()} chars` });
    };
    reader.readAsText(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const loadSample = () => {
    setFile({ name: "sample_feedback.txt", content: SAMPLE });
    toast.success("Sample feedback loaded");
  };

  const resetAgents = () => setAgents(DEFAULT_AGENTS.map((a) => ({ ...a, status: "idle" })));

  const startAgentAnimation = () => {
    // Reset then advance the first 4 agents on a timer while the AI call runs.
    resetAgents();
    const schedule = [400, 1500, 3000, 5000];
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    for (let i = 0; i < 4; i++) {
      const t = setTimeout(() => {
        setAgents((prev) =>
          prev.map((a, idx) => {
            if (idx < i) return { ...a, status: "done" };
            if (idx === i) return { ...a, status: "running" };
            return a;
          }),
        );
      }, schedule[i]);
      timeoutsRef.current.push(t);
    }
  };

  const analyze = async () => {
    if (!file) return;
    setIsRunning(true);
    startAgentAnimation();
    try {
      const result = await runAnalysis({ data: { content: file.content, filename: file.name } });
      // Finish steps 4 & 5
      setAgents((prev) =>
        prev.map((a, idx) => ({ ...a, status: idx < 4 ? "done" : "running" })),
      );
      await new Promise((r) => setTimeout(r, 600));
      setAgents((prev) => prev.map((a) => ({ ...a, status: "done" })));
      saveAnalysis({
        filename: file.name,
        createdAt: new Date().toISOString(),
        charCount: file.content.length,
        result,
      });
      toast.success("Analysis ready", { description: "Opening results…" });
      setTimeout(() => navigate({ to: "/results" }), 400);
    } catch (err) {
      console.error(err);
      setAgents((prev) =>
        prev.map((a) => (a.status === "running" ? { ...a, status: "error" } : a)),
      );
      toast.error("Analysis failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Feed the agents your customer signal
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Drop a transcript, survey export, or ticket dump. Watch the multi-agent pipeline read it end-to-end and
            hand you back a prioritized roadmap.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Upload */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              1 · Upload feedback
            </h2>

            {!file ? (
              <label
                htmlFor="ff-upload"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition ${
                  dragging
                    ? "border-primary bg-primary/10"
                    : "border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                }`}
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl btn-gradient">
                  <FileUp className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-medium">Drop a file, or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports {ACCEPTED.join(", ")} · up to 5MB
                </p>
                <input
                  id="ff-upload"
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  accept={ACCEPTED.join(",")}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.content.length.toLocaleString()} chars ·{" "}
                      {file.content.split(/\r?\n/).length.toLocaleString()} lines
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-muted-foreground">
                  {file.content.slice(0, 800)}
                  {file.content.length > 800 ? "\n…" : ""}
                </pre>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={loadSample}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Or load sample feedback
              </button>
              <button
                onClick={analyze}
                disabled={!file || isRunning}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-gradient disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Zap className="h-4 w-4 animate-pulse" /> Running…
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Run Multi-Agent Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Agents */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              2 · Agent pipeline
            </h2>
            <AgentFlow agents={agents} />
          </div>
        </div>
      </div>
    </div>
  );
}