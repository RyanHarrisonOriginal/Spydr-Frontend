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
import { DashboardAreaSummaryChart } from "../components/DashboardAreaSummaryChart";
import { DashboardPersonLoadSection } from "../components/DashboardPersonLoadSection";
import { DashboardStatusBreakdown } from "../components/DashboardStatusBreakdown";

export function DashboardPage() {
  const query = useWorkspaceDashboardQuery();
  const dashboard = query.data;
  usePageBreadcrumb("Dashboard");

  return (
    <div>
      <PageHeader
        title="Dashboard"
        meta={
          dashboard ? (
            <span>Updated {formatRelativeTime(dashboard.generatedAt)}</span>
          ) : undefined
        }
        actions={
          <Link
            to="/tasks"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-muted/20 px-3 text-[12px] hover:bg-muted/40"
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

          <div className="grid gap-6 px-8 pb-10 pt-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <DashboardPersonLoadSection dashboard={dashboard} />
            <div className="space-y-5">
              <DashboardStatusBreakdown
                title="Tasks by status"
                counts={dashboard.taskStatusCounts}
                total={dashboard.summary.totalTasks}
              />
              <DashboardStatusBreakdown
                title="Projects by status"
                counts={dashboard.projectStatusCounts}
                total={dashboard.summary.totalProjects}
                labelForStatus={(status) => status.replace(/_/g, " ")}
              />
              <DashboardAreaSummaryChart
                summaries={dashboard.areaSummaries}
                totalProjects={dashboard.summary.totalProjects}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
