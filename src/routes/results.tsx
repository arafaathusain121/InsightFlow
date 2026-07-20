import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Quote, TrendingUp, Users, Flame, MapPin } from "lucide-react";
import { Nav } from "../components/insightflow/Nav";
import { loadAnalysis, type StoredAnalysis } from "../lib/analysis-store";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — InsightFlow" },
      { name: "description", content: "Themes, prioritized problems, segments, and AI roadmap synthesized from your feedback." },
    ],
  }),
  component: Results,
});

function priorityColor(p: string) {
  switch (p) {
    case "critical":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    case "high":
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/15 text-yellow-200 border-yellow-500/30";
    default:
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }
}

function Results() {
  const [data, setData] = useState<StoredAnalysis | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadAnalysis());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (!data) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">No analysis yet</h1>
          <p className="mt-3 text-muted-foreground">
            Upload feedback on the dashboard to generate a roadmap.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-gradient"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { result } = data;
  const sortedProblems = [...result.problems].sort((a, b) => b.impact - a.impact);
  const maxFreq = Math.max(...result.themes.map((t) => t.frequency), 1);

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="glass mb-8 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Executive summary</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {data.filename}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-foreground/90">{result.summary}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>{data.charCount.toLocaleString()} chars analyzed</span>
            <span>·</span>
            <span>{result.themes.length} themes</span>
            <span>·</span>
            <span>{result.problems.length} problems</span>
            <span>·</span>
            <span>{new Date(data.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Themes */}
          <section className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Key themes</h2>
            </div>
            <ul className="space-y-3">
              {result.themes.map((t) => (
                <li key={t.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.frequency}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full btn-gradient"
                      style={{ width: `${Math.round((t.frequency / maxFreq) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{t.description}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Segments */}
          <section className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">User segments</h2>
            </div>
            <ul className="space-y-4">
              {result.segments.map((s) => (
                <li key={s.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.name}</span>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                      {s.size}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.painPoints.map((p) => (
                      <span
                        key={p}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Problems */}
        <section className="glass mt-6 rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Prioritized problems</h2>
          </div>
          <div className="grid gap-3">
            {sortedProblems.map((p, i) => (
              <div
                key={p.title}
                className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-sm font-mono text-muted-foreground">
                  #{i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{p.title}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${priorityColor(p.priority)}`}
                    >
                      {p.priority}
                    </span>
                    {p.affectedSegments.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <ScoreBar label="Impact" value={p.impact} tone="primary" />
                  <ScoreBar label="Effort" value={p.effort} tone="muted" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="glass mt-6 rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">AI roadmap recommendations</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {result.roadmap.map((r) => (
              <div key={r.phase} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold text-gradient">{r.phase}</span>
                  <span className="text-xs text-muted-foreground">{r.timeframe}</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                  {r.rationale}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quotes */}
        <section className="glass mt-6 rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Quote className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Evidence quotes</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.quotes.map((q, i) => (
              <blockquote
                key={i}
                className="rounded-xl border-l-2 border-primary/70 bg-white/[0.02] p-4 text-sm italic text-foreground/90"
              >
                “{q.text}”
                <div className="mt-2 flex gap-2 text-xs not-italic text-muted-foreground">
                  {q.segment && <span>· {q.segment}</span>}
                  {q.theme && <span>· {q.theme}</span>}
                </div>
              </blockquote>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, tone }: { label: string; value: number; tone: "primary" | "muted" }) {
  return (
    <div className="w-24">
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${tone === "primary" ? "btn-gradient" : "bg-white/40"}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}