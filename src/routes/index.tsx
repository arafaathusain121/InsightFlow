import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Upload, Bot, Target, Sparkles, LineChart, Quote } from "lucide-react";
import { Nav } from "../components/insightflow/Nav";
import { AgentFlow, DEFAULT_AGENTS } from "../components/insightflow/AgentFlow";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURES = [
  {
    icon: Bot,
    title: "5-agent AI pipeline",
    body: "Ingestion, extraction, theming, prioritization, and reporting agents each own a slice of the analysis.",
  },
  {
    icon: Upload,
    title: "Drop in any feedback",
    body: "Transcripts, CSV exports from Zendesk or Typeform, JSON dumps — parsed and normalized automatically.",
  },
  {
    icon: LineChart,
    title: "Impact-scored roadmap",
    body: "Every problem gets an impact / effort score and lands in a Now / Next / Later roadmap with rationale.",
  },
  {
    icon: Target,
    title: "Grounded in evidence",
    body: "Themes, segments, and priorities link back to verbatim customer quotes so nothing is invented.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 [background:var(--gradient-hero)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center sm:pt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Multi-agent research analyst · AI-powered pipeline
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Turn scattered customer feedback into a{" "}
            <span className="text-gradient">prioritized roadmap</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            InsightFlow reads your interviews, surveys, and support tickets, then runs a five-agent pipeline that
            extracts pain points, clusters themes, scores impact, and drafts the next quarter's roadmap.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold btn-gradient"
            >
              Analyze feedback <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-foreground/90 backdrop-blur transition hover:bg-white/10"
            >
              See how it works
            </a>
          </div>

          {/* Mock preview */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="glass rounded-3xl p-6 text-left">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="ml-3 text-xs text-muted-foreground">insightflow — live analysis</span>
              </div>
              <AgentFlow
                agents={DEFAULT_AGENTS.map((a, i) => ({
                  ...a,
                  status: i < 3 ? "done" : i === 3 ? "running" : "idle",
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Why InsightFlow</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            A research team in an agent loop
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl btn-gradient">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 pb-28">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Five specialized agents. One clear roadmap.
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <AgentFlow agents={DEFAULT_AGENTS.map((a) => ({ ...a, status: "done" }))} />
          <div className="glass rounded-2xl p-6">
            <Quote className="h-5 w-5 text-primary" />
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              "We used to spend two weeks synthesizing quarterly research. InsightFlow gave us the same shape of
              answer in eight minutes — with quotes for every claim."
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Head of Product, seed-stage SaaS</p>
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm text-muted-foreground">Ready to try it on your own data?</p>
              <Link
                to="/dashboard"
                className="mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-gradient"
              >
                Open the dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} InsightFlow
      </footer>
    </div>
  );
}
