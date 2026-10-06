import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  GitBranch,
  Lightbulb,
  FileText,
  Sun,
  Bot,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { SpydrMark } from "@/components/SpydrMark";
import { WebField } from "@/components/WebField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Signed-in redirect for `/` runs pre-paint in `index.html` via Clerk's
 * `__client_uat` cookie (static SPA stand-in for clerkMiddleware). This screen
 * never loads Clerk auth state and never shows a loader.
 */

const strands = [
  {
    icon: Sun,
    title: "Today",
    body: "See what needs you now",
  },
  {
    icon: FolderKanban,
    title: "Work",
    body: "Move projects and tasks together",
  },
  {
    icon: Lightbulb,
    title: "Ideas",
    body: "Capture sparks before they fade",
  },
  {
    icon: GitBranch,
    title: "Decisions",
    body: "Record the call and why",
  },
  {
    icon: FileText,
    title: "Notes",
    body: "Keep context with the work",
  },
] as const;

/*
 * Subhead options (max 20 words; problem → outcome):
 * 1. Scattered tasks, ideas, decisions, and notes become one connected place.
 * 2. Pull tasks, ideas, decisions, and notes out of the scatter into one place.
 * 3. Stop hunting across tools—keep tasks, ideas, decisions, and notes together.
 */
const SUBHEAD =
  "Scattered tasks, ideas, decisions, and notes become one connected place.";

/*
 * MCP title options (max 8 words):
 * 1. Your AI assistant, inside your web.
 * 2. Let your assistant work the web.
 * 3. AI that acts in your workspace.
 *
 * MCP sentence options (max 20 words; verified tools: create_project*, create_task(s),
 * create_idea, add_note_to_*; Claude allowed MCP client origin; no decisions tools):
 * 1. Claude and other MCP clients can plan projects, create tasks, and capture notes and ideas for you.
 * 2. Connect Claude or another MCP client to create projects, tasks, notes, and ideas in Spydr.
 * 3. MCP clients like Claude can create and update projects, tasks, notes, and ideas.
 *
 * Chips from live tools only: create_task(s), create_project*, create_idea, add_note_to_*.
 */
const MCP_TITLE = "Your AI assistant, inside your web.";
const MCP_SENTENCE =
  "Claude and other MCP clients can plan projects, create tasks, and capture notes and ideas for you.";
const MCP_CHIPS = [
  "Create tasks",
  "Plan projects",
  "Capture ideas",
  "Add notes",
] as const;

function DeferredWebField() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 400 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timeout = window.setTimeout(enable, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <WebField
        className="absolute -inset-[4%] h-[108%] w-[108%]"
        intensity="focus"
        fit="slice"
      />
      {/* Keep copy readable on the left; let the spun web breathe on the right. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--canvas))] via-[hsl(var(--canvas)/0.78)] to-[hsl(var(--canvas)/0.28)] md:via-[hsl(var(--canvas)/0.72)] md:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[hsl(var(--canvas))] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[hsl(var(--canvas)/0.55)] to-transparent" />
    </div>
  );
}

export default function MarketingScreen() {
  const year = new Date().getFullYear();

  return (
    <div className="spydr-atmosphere spydr-marketing-shell relative flex h-full flex-col text-foreground">
      <header className="spydr-rule spydr-glass relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 md:px-8">
        <Logo size="sm" />
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </header>

      <main className="relative isolate flex min-h-0 flex-1 flex-col px-4 py-6 md:px-8 md:py-8 lg:px-10">
        <DeferredWebField />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
          <div className="spydr-marketing-enter flex w-full max-w-[560px] shrink-0 flex-col justify-center">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <SpydrMark size={32} className="shrink-0" alt="" />
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-foreground">
                Spydr<span className="text-highlight-secondary">.</span>
              </span>
            </div>

            <h1 className="mb-3 max-w-[560px] text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground md:mb-4 md:text-[48px] xl:text-[56px]">
              One web for the work that matters.
            </h1>

            <p className="mb-6 max-w-[560px] text-[16px] leading-relaxed text-[hsl(220_14%_82%)] md:mb-8">
              {SUBHEAD}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild>
                <Link to="/sign-up">Get started</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Right column: surface panel + MCP card (second product message) */}
          <div className="spydr-marketing-enter-panel relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-3">
            <ul
              className="spydr-marketing-panel grid grid-rows-5 overflow-hidden rounded-md border border-white/15"
              aria-label="Workspace areas"
            >
              {strands.map((strand) => {
                const Icon = strand.icon;
                return (
                  <li
                    key={strand.title}
                    className="grid min-h-[44px] grid-cols-[20px_minmax(5.5rem,7rem)_1fr] items-center gap-3 border-b border-white/10 px-4 py-2 last:border-b-0 md:min-h-[48px]"
                  >
                    <Icon
                      className="h-5 w-5 shrink-0 text-highlight"
                      aria-hidden
                      strokeWidth={1.75}
                    />
                    <span className="text-[14px] font-semibold leading-none tracking-tight text-foreground">
                      {strand.title}
                    </span>
                    <span className="text-[14px] leading-snug text-[hsl(220_12%_78%)]">
                      {strand.body}
                    </span>
                  </li>
                );
              })}
            </ul>

            <aside
              className="spydr-marketing-panel spydr-marketing-mcp rounded-md border border-white/15 border-l-2 border-l-highlight px-4 py-3"
              aria-label="MCP"
            >
              <div className="mb-2 flex items-center gap-2">
                <Bot
                  className="h-4 w-4 shrink-0 text-highlight"
                  aria-hidden
                  strokeWidth={1.75}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(220_12%_68%)]">
                  MCP
                </span>
              </div>

              <h2 className="mb-1.5 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-foreground md:text-[20px]">
                {MCP_TITLE}
              </h2>

              <p className="mb-3 text-[14px] leading-snug text-[hsl(220_12%_78%)]">
                {MCP_SENTENCE}
              </p>

              <ul className="mb-3 flex flex-wrap gap-2" aria-label="MCP capabilities">
                {MCP_CHIPS.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-sm border border-white/10 bg-white/[0.03] px-2 py-1 text-[12px] leading-none text-[hsl(220_12%_78%)]"
                  >
                    {chip}
                  </li>
                ))}
              </ul>

              <Link
                to="/docs/mcp/claude"
                className={cn(
                  "inline-flex text-[14px] font-medium text-highlight underline-offset-4 hover:underline",
                  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                Connect in minutes
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-t border-white/10 px-4 py-3 md:px-8">
        <span className="text-[14px] text-[hsl(220_12%_78%)]">© {year} Spydr</span>
        <nav className="flex items-center gap-6" aria-label="Legal">
          <Link
            to="/privacy"
            className={cn(
              "text-[14px] text-[hsl(220_12%_78%)] transition-colors hover:text-foreground",
              "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className={cn(
              "text-[14px] text-[hsl(220_12%_78%)] transition-colors hover:text-foreground",
              "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            Terms
          </Link>
        </nav>
      </footer>
    </div>
  );
}
