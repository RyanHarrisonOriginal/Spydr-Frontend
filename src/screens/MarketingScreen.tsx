import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  FolderKanban,
  GitBranch,
  Lightbulb,
  FileText,
  Sun,
} from "lucide-react";
import { SignalField } from "@/shared/brand/SignalField";
import { SpydrMark } from "@/shared/brand/SpydrMark";
import "./marketing-splash.css";

/**
 * Signed-in redirect for `/` runs pre-paint in `index.html` via Clerk's
 * `__client_uat` cookie (static SPA stand-in for clerkMiddleware). This screen
 * never loads Clerk auth state and never shows a loader. The nav still checks
 * the same cookie so a rare paint still shows "Open Spydr".
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
    body: "Projects and tasks, with blockers in plain sight",
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

const USER_LINE =
  "Add a task to Website relaunch: send the client the written summary, due Friday.";

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

/** Same cookie the pre-paint gate uses — no Clerk hook on this route. */
function hasActiveClerkSession() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)__client_uat=([^;]*)/);
    const value = match ? decodeURIComponent(match[1]) : "";
    return Boolean(value && value !== "0");
  } catch {
    return false;
  }
}

function ExampleExchange({ reducedMotion }: { reducedMotion: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(reducedMotion ? USER_LINE.length : 0);
  const [toolVisible, setToolVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const root = rootRef.current;
    if (!root) return;

    let intervalId = 0;
    let toolTimeout = 0;
    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return;
        started = true;
        observer.disconnect();

        let i = 0;
        intervalId = window.setInterval(() => {
          i += 1;
          setTyped(i);
          if (i >= USER_LINE.length) {
            window.clearInterval(intervalId);
            toolTimeout = window.setTimeout(() => setToolVisible(true), 300);
          }
        }, 30);
      },
      { threshold: 0.35 },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.clearTimeout(toolTimeout);
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="marketing-splash__exchange">
      <div className="marketing-splash__exchange-user">
        <span className="marketing-splash__avatar" aria-hidden>
          Y
        </span>
        <p className="marketing-splash__exchange-text" aria-label={USER_LINE}>
          <span aria-hidden>{USER_LINE.slice(0, typed)}</span>
        </p>
      </div>
      <div
        className={
          toolVisible
            ? "marketing-splash__exchange-tool marketing-splash__exchange-tool--visible"
            : "marketing-splash__exchange-tool"
        }
        aria-hidden={!toolVisible}
      >
        <span className="marketing-splash__exchange-dot" />
        <span>
          create_task <span className="marketing-splash__sep">·</span> Website
          relaunch <span className="marketing-splash__sep">·</span> due fri
        </span>
      </div>
    </div>
  );
}

export default function MarketingScreen() {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [signedIn] = useState(hasActiveClerkSession);

  return (
    <div className="marketing-splash">
      <SignalField static={reducedMotion} />

      <header className="marketing-splash__header">
        <Link to="/" className="marketing-splash__brand">
          <SpydrMark size={22} variant="compact" static decorative />
          <span className="marketing-splash__brand-name">Spydr</span>
        </Link>

        <div className="marketing-splash__nav-actions">
          {signedIn ? (
            <Link to="/today" className="marketing-splash__nav-cta">
              Open Spydr
            </Link>
          ) : (
            <>
              <Link to="/sign-in" className="marketing-splash__nav-link">
                Sign in
              </Link>
              <Link to="/sign-up" className="marketing-splash__nav-cta">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="marketing-splash__main">
        <section className="marketing-splash__copy">
          <SpydrMark
            className="marketing-splash__mark"
            size={96}
            intro={!reducedMotion}
            static={reducedMotion}
          />
          <h1 className="marketing-splash__title">
            One web for the work that matters.
          </h1>
          <p className="marketing-splash__lede">
            Tasks, ideas, decisions and notes in one connected place, so nothing
            you&apos;re carrying gets dropped.
          </p>
          <div className="marketing-splash__ctas">
            {signedIn ? (
              <Link to="/today" className="marketing-splash__btn-primary">
                Open Spydr
              </Link>
            ) : (
              <>
                <Link to="/sign-up" className="marketing-splash__btn-primary">
                  Get started
                </Link>
                <Link to="/sign-in" className="marketing-splash__btn-secondary">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </section>

        <div className="marketing-splash__panels">
          <ul
            className="marketing-splash__panel marketing-splash__strands"
            aria-label="Workspace areas"
          >
            {strands.map((strand) => {
              const Icon = strand.icon;
              return (
                <li key={strand.title} className="marketing-splash__strand">
                  <Icon
                    className="marketing-splash__strand-icon"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  <span className="marketing-splash__strand-name">
                    {strand.title}
                  </span>
                  <span className="marketing-splash__strand-body">
                    {strand.body}
                  </span>
                </li>
              );
            })}
          </ul>

          <aside
            className="marketing-splash__panel marketing-splash__ai"
            aria-label="AI assistant"
          >
            <div className="marketing-splash__ai-head">
              <h2 className="marketing-splash__ai-title">
                Your AI assistant, inside your web
              </h2>
              <span className="marketing-splash__ai-via">via MCP</span>
            </div>
            <p className="marketing-splash__ai-lede">
              Claude and other MCP clients can plan projects, create tasks and
              capture notes for you.
            </p>

            <ExampleExchange reducedMotion={reducedMotion} />

            <Link to="/docs/mcp/claude" className="marketing-splash__connect">
              Connect in minutes
            </Link>
          </aside>
        </div>
      </main>

      <footer className="marketing-splash__footer">
        <span>© 2026 Spydr</span>
        <nav className="marketing-splash__legal" aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
