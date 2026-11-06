import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import {
  WorkPulse,
  type WorkPulseKind,
} from "@/domain/spydr/features/work/components/WorkPulse";
import { workTasksPath } from "@/domain/spydr/features/work/utils/workPaths";
import { useDashboardView } from "../hooks/useDashboardView";
import { DashboardTotalsStrip } from "../components/DashboardTotalsStrip";
import { DashboardNeedsAttention } from "../components/DashboardNeedsAttention";
import { DashboardTaskMixPanel } from "../components/DashboardTaskMix";
import { DashboardAreas } from "../components/DashboardAreas";
import { DashboardLoadByPerson } from "../components/DashboardLoadByPerson";
import "./dashboard-page.css";

function formatUpdatedLabel(dataUpdatedAt: number, now = Date.now()): string {
  if (!dataUpdatedAt) return "updated just now";
  const seconds = Math.max(0, Math.floor((now - dataUpdatedAt) / 1000));
  if (seconds < 45) return "updated just now";
  if (seconds < 90) return "updated 1m ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `updated ${hours}h ago`;
  return `updated ${Math.floor(hours / 24)}d ago`;
}

export function DashboardPage() {
  const { view, isLoading, isError, errorMessage, dataUpdatedAt } =
    useDashboardView();
  const navigate = useNavigate();
  usePageBreadcrumb("Dashboard");

  const applyPulseFilter = (kind: WorkPulseKind) => {
    if (kind === "overdue") {
      navigate(workTasksPath({ person: "all", due: "overdue" }));
    } else if (kind === "blocked") {
      navigate(workTasksPath({ person: "all", status: "blocked" }));
    } else {
      navigate(workTasksPath({ person: "all", due: "this_week" }));
    }
  };

  return (
    <div className="dashboard-page absolute inset-0 flex min-h-0 flex-col overflow-y-auto">
      <PageHeader
        dense
        atmosphere={false}
        showBreadcrumbs={false}
        inlineMeta
        className="dashboard-page-header"
        titleClassName="text-[24px] font-semibold tracking-[-0.03em] text-[var(--fg)]"
        title="Dashboard"
        meta={
          view ? (
            <WorkPulse counts={view.pulse} onSelect={applyPulseFilter} />
          ) : undefined
        }
        actions={
          <span className="dashboard-updated">
            {formatUpdatedLabel(dataUpdatedAt)}
          </span>
        }
      />

      {isLoading && <LoadingState title="Loading dashboard" />}
      {isError && (
        <ErrorState title="Dashboard unavailable" description={errorMessage} />
      )}

      {!isLoading && !isError && view ? (
        <div className="dashboard-page-body">
          <DashboardTotalsStrip totals={view.totals} />
          <div className="dashboard-panels">
            <DashboardNeedsAttention
              items={view.attention}
              more={view.attentionMore}
            />
            <DashboardTaskMixPanel mix={view.taskMix} />
            <DashboardAreas
              areas={view.areas}
              openTaskTotal={view.openTaskTotal}
            />
            <DashboardLoadByPerson
              loads={view.personLoads}
              openTaskTotal={view.openTaskTotal}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
