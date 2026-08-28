import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { useWorkspaceDashboardQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { cn } from "@/lib/utils";
import { dashboardMetrics } from "@/domain/spydr/utils/dashboardModel";
import { DashboardPersonLoadSection } from "../components/DashboardPersonLoadSection";
import { DashboardDistribution } from "../components/DashboardDistribution";

export function DashboardPage() {
  const query = useWorkspaceDashboardQuery();
  const dashboard = query.data;
  usePageBreadcrumb("Dashboard");

  return (
    <div className="pb-8">
      <PageHeader
        dense
        title="Dashboard"
        meta={
          dashboard ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Updated {formatRelativeTime(dashboard.generatedAt)}
            </span>
          ) : undefined
        }
        actions={
          <Link
            to="/work?view=tasks"
            className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-border bg-muted/20 px-2.5 text-[12px] hover:bg-muted/40"
          >
            View tasks
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {query.isLoading && <LoadingState title="Loading dashboard" />}
      {query.isError && (
        <ErrorState
          title="Dashboard unavailable"
          description={
            query.error instanceof Error
              ? query.error.message
              : "Failed to load dashboard"
          }
        />
      )}

      {!query.isLoading && !query.isError && dashboard && (
        <>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-border px-6 py-3">
            {dashboardMetrics.map((metric) => {
              const value = metric.getValue(dashboard.summary);
              const hint = metric.hint?.(dashboard.summary);
              const warn = metric.tone === "warn" && value > 0;
              return (
                <div key={metric.id} className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {metric.label}
                  </span>
                  <span
                    className={cn(
                      "text-[18px] font-semibold tabular-nums tracking-tight",
                      warn
                        ? "text-[hsl(var(--status-blocked))]"
                        : "text-foreground"
                    )}
                  >
                    {value}
                  </span>
                  {hint ? (
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {hint}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <DashboardPersonLoadSection dashboard={dashboard} />
          <DashboardDistribution dashboard={dashboard} />
        </>
      )}
    </div>
  );
}
