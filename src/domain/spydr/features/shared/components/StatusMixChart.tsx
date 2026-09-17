import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import {
  countTotal,
  ratioPercent,
  sortedStatusEntries,
} from "@/domain/spydr/utils/dashboardModel";
import { isTaskStatus, taskStatusLabels } from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";

export function statusStrokeColor(status: string): string {
  switch (status) {
    case "active":
      return "hsl(var(--status-active))";
    case "waiting":
    case "snoozed":
      return "hsl(var(--status-doing))";
    case "blocked":
      return "hsl(var(--status-blocked))";
    case "completed":
      return "hsl(var(--status-done))";
    default:
      return "hsl(var(--status-todo))";
  }
}

export function mixStatusLabel(status: string) {
  return isTaskStatus(status)
    ? taskStatusLabels[status]
    : status.replace(/_/g, " ");
}

export function DashboardStatusDonut({
  counts,
  centerPercent,
  centerLabel,
  centerCaption = "complete",
  size = 88,
  stroke = 11,
}: {
  counts: Record<string, number>;
  centerPercent: number;
  centerLabel: string;
  centerCaption?: string;
  size?: number;
  stroke?: number;
}) {
  const total = countTotal(counts);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const slices = sortedStatusEntries(counts)
    .filter((entry) => entry.count > 0)
    .map((slice) => {
      const length = total > 0 ? (slice.count / total) * circumference : 0;
      const next = { ...slice, length, offset };
      offset += length;
      return next;
    });

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${centerLabel}: ${centerPercent}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.18)"
          strokeWidth={stroke}
        />
        {total > 0
          ? slices.map((slice) => (
              <circle
                key={slice.status}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={statusStrokeColor(slice.status)}
                strokeWidth={stroke}
                strokeDasharray={`${slice.length} ${Math.max(circumference - slice.length, 0)}`}
                strokeDashoffset={-slice.offset}
              >
                <title>{`${mixStatusLabel(slice.status)}: ${slice.count}`}</title>
              </circle>
            ))
          : null}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="flex flex-col items-center leading-none">
          <span className="text-[15px] font-semibold tabular-nums tracking-tight">
            {centerPercent}
            <span className="text-[10px] font-medium text-muted-foreground">%</span>
          </span>
          <span className="mt-1 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
            {centerCaption}
          </span>
        </span>
      </div>
    </div>
  );
}

export function StatusMixChart({
  title,
  counts,
  centerPercent,
  centerLabel,
  centerCaption = "complete",
  className,
  quiet = false,
}: {
  title: string;
  counts: Record<string, number>;
  centerPercent: number;
  centerLabel: string;
  centerCaption?: string;
  className?: string;
  quiet?: boolean;
}) {
  const total = countTotal(counts);
  const rows = sortedStatusEntries(counts);

  return (
    <div
      className={cn(
        "min-w-0",
        quiet
          ? "p-0"
          : "rounded-sm border border-border/60 bg-muted/10 p-3 md:p-4",
        className
      )}
    >
      <div className={cn("flex items-center", quiet ? "gap-3" : "gap-4")}>
        <DashboardStatusDonut
          counts={counts}
          centerPercent={centerPercent}
          centerLabel={centerLabel}
          centerCaption={centerCaption}
          size={quiet ? 72 : 88}
          stroke={quiet ? 9 : 11}
        />
        <div className="min-w-0 flex-1">
          {quiet ? (
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {total} {total === 1 ? "task" : "tasks"}
            </p>
          ) : (
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {total}
              </span>
            </div>
          )}
          {rows.length === 0 ? (
            <p className={cn("text-[12px] text-muted-foreground", quiet ? "mt-1" : "mt-2")}>
              Nothing here yet.
            </p>
          ) : (
            <ul className={cn(quiet ? "mt-1.5 space-y-0.5" : "mt-2 space-y-1")}>
              {rows.map((row) => (
                <li
                  key={row.status}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex min-w-0 items-center gap-1.5 text-[12px] capitalize text-foreground/90">
                    <StatusDot status={row.status} />
                    <span className="truncate">{mixStatusLabel(row.status)}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {row.count}
                    <span className="ml-1 text-[10px] text-muted-foreground/70">
                      {ratioPercent(row.count, total)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

