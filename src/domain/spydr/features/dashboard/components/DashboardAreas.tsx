import { TruncatedText } from "@/domain/spydr/features/shared/components/TruncatedText";
import { hslColorCss } from "@/domain/spydr/utils/projectAreaColors";
import type { DashboardAreaRow } from "../utils/buildDashboardView";
import { DashboardTickBar } from "./DashboardTickBar";
import { cn } from "@/lib/utils";

export function DashboardAreas({
  areas,
  openTaskTotal,
}: {
  areas: DashboardAreaRow[];
  openTaskTotal: number;
}) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Areas</h2>
        <span className="dashboard-panel-count">{areas.length}</span>
      </div>

      <div
        className="dashboard-col-header"
        style={{
          gridTemplateColumns: "minmax(0,1fr) 72px 72px 140px",
        }}
      >
        <span>Area</span>
        <span className="text-right">Projects</span>
        <span className="text-right">Open</span>
        <span>Share of open</span>
      </div>

      {areas.length === 0 ? (
        <p className="dashboard-empty">No areas yet.</p>
      ) : (
        areas.map((area) => {
          const noArea = area.id === null;
          return (
            <div
              key={area.id ?? "none"}
              className="dashboard-row dashboard-row-area"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    noArea && "bg-transparent shadow-[inset_0_0_0_1px_#5C626B]"
                  )}
                  style={
                    noArea || !area.color
                      ? undefined
                      : { backgroundColor: hslColorCss(area.color) }
                  }
                  aria-hidden
                />
                <span
                  className={cn(
                    "min-w-0 text-[13px] capitalize",
                    noArea ? "text-[var(--muted)]" : "text-[var(--fg)]"
                  )}
                >
                  <TruncatedText text={area.name} />
                </span>
              </span>
              <span className="text-right font-mono text-[12px] tabular-nums text-[var(--muted)]">
                {area.projects}
              </span>
              <span className="text-right font-mono text-[12px] tabular-nums text-[var(--fg)]">
                {area.openTasks}
              </span>
              <DashboardTickBar
                ratio={
                  openTaskTotal > 0 ? area.openTasks / openTaskTotal : 0
                }
                className="mt-0"
              />
            </div>
          );
        })
      )}
    </section>
  );
}
