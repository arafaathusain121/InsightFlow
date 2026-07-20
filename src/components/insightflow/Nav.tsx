import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg btn-gradient">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg">
            Insight<span className="text-gradient">Flow</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-2 text-muted-foreground transition hover:text-foreground data-[status=active]:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md px-3 py-2 text-muted-foreground transition hover:text-foreground data-[status=active]:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            to="/results"
            className="rounded-md px-3 py-2 text-muted-foreground transition hover:text-foreground data-[status=active]:text-foreground"
          >
            Results
          </Link>
          <Link
            to="/dashboard"
            className="ml-3 rounded-lg px-4 py-2 text-sm font-medium btn-gradient"
          >
            Launch app
          </Link>
        </nav>
      </div>
    </header>
  );
}