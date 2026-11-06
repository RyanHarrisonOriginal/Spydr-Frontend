import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { TruncatedText } from "@/domain/spydr/features/shared/components/TruncatedText";
import type { DashboardTaskMix as TaskMix } from "../utils/buildDashboardView";
import { ratioPercent } from "../utils/buildDashboardView";
import { cn } from "@/lib/utils";

const mixOrder = [
  { key: "active", label: "Active", tone: "active" },
  { key: "blocked", label: "Blocked", tone: "danger" },
  { key: "waiting", label: "Waiting", tone: "warn" },
  { key: "done", label: "Done", tone: "done" },
] as const;

export function DashboardTaskMixPanel({ mix }: { mix: TaskMix }) {
  const segments = mixOrder
    .map((entry) => ({
      ...entry,
      count: mix[entry.key],
    }))
    .filter((entry) => entry.count > 0);

  const ariaLabel = mixOrder
    .map((entry) => `${entry.label} ${mix[entry.key]}`)
    .join(", ");

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Task mix</h2>
        <span className="dashboard-panel-count">{mix.total} tasks</span>
        <span className="dashboard-panel-header-end">{mix.pctDone}% done</span>
      </div>

      <div
        className="dashboard-mix-bar"
        role="img"
        aria-label={ariaLabel}
      >
        {segments.map((segment) => (
          <span
            key={segment.key}
            className={cn(
              "dashboard-mix-segment",
              segment.tone === "active" && "dashboard-tick-fill-active",
              segment.tone === "danger" && "dashboard-tick-fill-danger",
              segment.tone === "warn" && "dashboard-tick-fill-warn",
              segment.tone === "done" && "dashboard-tick-fill-done"
            )}
            style={{ flex: segment.count }}
          />
        ))}
      </div>

      <div className="dashboard-mix-legend">
        {mixOrder.map((entry) => {
          const count = mix[entry.key];
          const pct = ratioPercent(count, mix.total);
          return (
            <div key={entry.key} className="dashboard-mix-legend-row">
              <span className="flex min-w-0 items-center gap-2 text-[13px]">
                <StatusDot
                  status={entry.key === "done" ? "completed" : entry.key}
                />
                <span
                  className={cn(
                    "min-w-0",
                    entry.key === "done"
                      ? "text-[var(--muted)]"
                      : "text-[var(--fg)]"
                  )}
                >
                  <TruncatedText text={entry.label} />
                </span>
              </span>
              <span className="font-mono text-[12px] tabular-nums text-[var(--fg)]">
                {count}
              </span>
              <span className="text-right font-mono text-[11px] tabular-nums text-[var(--muted-2)]">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
