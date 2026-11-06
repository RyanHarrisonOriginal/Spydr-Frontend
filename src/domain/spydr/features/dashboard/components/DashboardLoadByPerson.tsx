import {
  PersonAvatar,
  UnassignedAvatar,
} from "@/domain/spydr/features/people/components/PersonIdentity";
import { TruncatedText } from "@/domain/spydr/features/shared/components/TruncatedText";
import type { DashboardPersonLoadRow } from "../utils/buildDashboardView";
import { DashboardTickBar } from "./DashboardTickBar";
import { cn } from "@/lib/utils";

export function DashboardLoadByPerson({
  loads,
  openTaskTotal,
}: {
  loads: DashboardPersonLoadRow[];
  openTaskTotal: number;
}) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Load by person</h2>
        <span className="dashboard-panel-count">{loads.length}</span>
      </div>

      <div
        className="dashboard-col-header"
        style={{
          gridTemplateColumns: "minmax(0,1fr) 64px 48px 120px 40px",
        }}
      >
        <span>Person</span>
        <span className="text-right">Projects</span>
        <span className="text-right">Late</span>
        <span />
        <span className="text-right">Open</span>
      </div>

      {loads.length === 0 ? (
        <p className="dashboard-empty">No assigned work yet.</p>
      ) : (
        loads.map((load) => (
          <div
            key={load.person?.id ?? "unassigned"}
            className={cn(
              "dashboard-row dashboard-row-person",
              load.isUnassigned && "dashboard-row-person-unassigned"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              {load.isUnassigned ? (
                <UnassignedAvatar size="sm" className="h-5 w-5" />
              ) : (
                <PersonAvatar
                  person={load.person}
                  size="sm"
                  className="h-5 w-5 text-[8px]"
                />
              )}
              <span
                className={cn(
                  "min-w-0 text-[13px]",
                  load.isUnassigned
                    ? "text-[var(--muted)]"
                    : "text-[var(--fg)]"
                )}
              >
                <TruncatedText text={load.label} />
              </span>
            </span>
            <span className="text-right font-mono text-[12px] tabular-nums text-[var(--muted)]">
              {load.projects}
            </span>
            <span
              className="text-right font-mono text-[12px] tabular-nums"
              style={{
                color: load.late > 0 ? "var(--danger)" : "#3A3F47",
              }}
            >
              {load.late}
            </span>
            <DashboardTickBar
              ratio={openTaskTotal > 0 ? load.openTasks / openTaskTotal : 0}
              className="mt-0"
            />
            <span
              className={cn(
                "text-right font-mono text-[12px] tabular-nums",
                load.openTasks === 0
                  ? "text-[var(--muted-2)]"
                  : "text-[var(--fg)]"
              )}
            >
              {load.openTasks}
            </span>
          </div>
        ))
      )}
    </section>
  );
}
