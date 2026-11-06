import { Link } from "react-router-dom";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { TruncatedText } from "@/domain/spydr/features/shared/components/TruncatedText";
import { workTasksPath } from "@/domain/spydr/features/work/utils/workPaths";
import type { DashboardAttentionItem } from "../utils/buildDashboardView";
import { cn } from "@/lib/utils";

/** Open Work unscoped — attention is an OR of overdue / blocked / waiting. */
const attentionWorkHref = workTasksPath({ person: "all" });

export function DashboardNeedsAttention({
  items,
  more,
}: {
  items: DashboardAttentionItem[];
  more: number;
}) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Needs attention</h2>
        <span className="dashboard-panel-count">
          {items.length + more}
        </span>
        <Link to={attentionWorkHref} className="dashboard-panel-link">
          Open in Work
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="dashboard-empty">Nothing needs you right now.</p>
      ) : (
        <>
          {items.map((item) => (
            <div
              key={`${item.kind}-${item.id}`}
              className="dashboard-row dashboard-row-attention"
            >
              <div className="flex min-w-0 items-center gap-2">
                <StatusDot status={item.status} className="shrink-0" />
                <Link
                  to={item.href}
                  className={cn(
                    "min-w-0 text-[13px] text-[var(--fg)] hover:underline",
                    item.kind === "project" && "font-semibold"
                  )}
                >
                  <TruncatedText text={item.title} />
                </Link>
              </div>
              <span className="min-w-0 text-[12px] text-[var(--muted)]">
                <TruncatedText text={item.reason} />
              </span>
              <span className="text-right font-mono text-[11px] text-[var(--danger)]">
                {item.lateLabel}
              </span>
            </div>
          ))}
          {more > 0 ? (
            <Link
              to={attentionWorkHref}
              className="dashboard-row dashboard-row-attention text-[13px] text-[var(--muted)] hover:text-[var(--fg)]"
            >
              +{more} more
            </Link>
          ) : null}
        </>
      )}
    </section>
  );
}
