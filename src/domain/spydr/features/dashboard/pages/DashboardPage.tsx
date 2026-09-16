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
import { DashboardMetricStrip } from "../components/DashboardMetricStrip";
import { DashboardPersonLoadSection } from "../components/DashboardPersonLoadSection";
import { DashboardDistribution } from "../components/DashboardDistribution";

export function DashboardPage() {
  const query = useWorkspaceDashboardQuery();
  const dashboard = query.data;
  usePageBreadcrumb("Dashboard");

  const pressure = dashboard
    ? dashboard.summary.blockedTasks + dashboard.summary.overdueTasks
    : 0;

  return (
    <div className="pb-10">
      <PageHeader
        dense
        title="Dashboard"
        meta={
          dashboard ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Updated {formatRelativeTime(dashboard.generatedAt)}
              {pressure > 0 ? (
                <>
                  {" · "}
                  <span className="text-[hsl(var(--status-blocked))]">
                    {pressure} need attention
                  </span>
                </>
              ) : (
                " · Clear"
              )}
            </span>
          ) : undefined
        }
        actions={
          <Link
            to="/work?view=tasks"
            className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12px] text-muted-foreground hover:bg-muted/40 hover:text-foreground"
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
          <DashboardMetricStrip summary={dashboard.summary} />
          <DashboardDistribution dashboard={dashboard} />
          <DashboardPersonLoadSection dashboard={dashboard} />
        </>
      )}
    </div>
  );
}
