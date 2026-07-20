import { CheckCircle2, Circle, Loader2, type LucideIcon } from "lucide-react";
import { Inbox, Scan, Layers, TrendingUp, FileText } from "lucide-react";

export type AgentStatus = "idle" | "running" | "done" | "error";

export type AgentStep = {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  icon: LucideIcon;
};

export const DEFAULT_AGENTS: AgentStep[] = [
  {
    id: "ingest",
    name: "Ingestion Agent",
    role: "Normalize & parse",
    description: "Cleans and chunks raw text, CSV rows, and JSON records into structured feedback units.",
    status: "idle",
    icon: Inbox,
  },
  {
    id: "extract",
    name: "Extraction Agent",
    role: "Pain points & segments",
    description: "Detects explicit pain points, sentiment, and user segments across every record.",
    status: "idle",
    icon: Scan,
  },
  {
    id: "theme",
    name: "Theme Agent",
    role: "Cluster & group",
    description: "Groups related pain points into named themes with representative evidence.",
    status: "idle",
    icon: Layers,
  },
  {
    id: "prioritize",
    name: "Prioritization Agent",
    role: "Impact vs effort scoring",
    description: "Scores each problem on impact, effort, and reach to produce a ranked backlog.",
    status: "idle",
    icon: TrendingUp,
  },
  {
    id: "report",
    name: "Report Agent",
    role: "Roadmap synthesis",
    description: "Composes the final Now/Next/Later roadmap with quotes and rationale.",
    status: "idle",
    icon: FileText,
  },
];

export function AgentFlow({ agents }: { agents: AgentStep[] }) {
  return (
    <ol className="relative space-y-3">
      {agents.map((agent, i) => {
        const Icon = agent.icon;
        const running = agent.status === "running";
        const done = agent.status === "done";
        const error = agent.status === "error";
        return (
          <li
            key={agent.id}
            className={`glass relative flex items-start gap-4 rounded-2xl p-4 transition ${
              running ? "ring-1 ring-primary/60 shadow-[0_0_40px_-10px_var(--primary)]" : ""
            } ${done ? "opacity-95" : ""} ${agent.status === "idle" ? "opacity-60" : ""}`}
          >
            <div
              className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 ${
                running || done ? "btn-gradient" : "bg-white/5"
              }`}
            >
              <Icon className="h-5 w-5" />
              {running && (
                <span className="absolute -inset-1 animate-ping rounded-xl border border-primary/50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  0{i + 1}
                </span>
                <h3 className="text-sm font-semibold">{agent.name}</h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {agent.role}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{agent.description}</p>
            </div>
            <div className="shrink-0">
              {done && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {running && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {error && <span className="text-xs text-destructive">Failed</span>}
              {agent.status === "idle" && <Circle className="h-5 w-5 text-muted-foreground/40" />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}