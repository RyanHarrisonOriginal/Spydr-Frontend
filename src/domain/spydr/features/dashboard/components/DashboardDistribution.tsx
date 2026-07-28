import type { ReactNode } from "react";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { AreaColorSwatch } from "@/domain/spydr/features/projects/components/AreaColorSwatch";
import {
  sortedAreaSummaries,
  sortedStatusEntries,
} from "@/domain/spydr/utils/dashboardModel";
import type {
  WorkspaceDashboard,
  WorkspaceDashboardStatusCounts,
} from "@/domain/spydr/utils/workspaceDashboard";
import { taskStatusLabels, isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";

interface DashboardDistributionProps {
  dashboard: WorkspaceDashboard;
}

function statusLabel(status: string) {
  return isTaskStatus(status) ? taskStatusLabels[status] : status.replace(/_/g, " ");
}

function CountList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<{
    key: string;
    label: string;
    count: number;
    leading?: ReactNode;
    warn?: boolean;
  }>;
  empty: string;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-[13px] font-medium text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border/50 border-y border-border/50">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between gap-3 py-1.5 text-[12px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                {row.leading}
                <span className="truncate capitalize text-foreground/90">
                  {row.label}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono tabular-nums",
                  row.warn
                    ? "text-[hsl(var(--status-blocked))]"
                    : "text-muted-foreground"
                )}
              >
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toStatusRows(counts: WorkspaceDashboardStatusCounts) {
  return sortedStatusEntries(counts).map((entry) => ({
    key: entry.status,
    label: statusLabel(entry.status),
    count: entry.count,
    leading: <StatusDot status={entry.status} />,
    warn: entry.status === "blocked",
  }));
}

export function DashboardDistribution({ dashboard }: DashboardDistributionProps) {
  const areaRows = sortedAreaSummaries(dashboard.areaSummaries)
    .filter((entry) => entry.projects > 0)
    .map((entry) => ({
      key: entry.id ?? `area:${entry.name}`,
      label: entry.name,
      count: entry.projects,
      leading: <AreaColorSwatch color={entry.color} className="h-2.5 w-2.5" />,
    }));

  return (
    <section className="grid gap-8 px-6 py-5 md:grid-cols-3">
      <CountList
        title="Tasks"
        rows={toStatusRows(dashboard.taskStatusCounts)}
        empty="No tasks yet."
      />
      <CountList
        title="Projects"
        rows={toStatusRows(dashboard.projectStatusCounts)}
        empty="No projects yet."
      />
      <CountList title="Areas" rows={areaRows} empty="No areas yet." />
    </section>
  );
}
