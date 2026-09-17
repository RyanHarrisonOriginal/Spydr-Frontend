import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardSection({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border-t border-border/70 md:last:border-l",
        className
      )}
    >
      <div className="flex shrink-0 items-baseline gap-2 px-4 pb-2 pt-3 md:px-6">
        <h2 className="text-[13px] font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {meta ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  );
}

export function DashboardSegmentBar({
  segments,
  className,
  trackClassName,
}: {
  segments: Array<{
    key: string;
    value: number;
    className: string;
    label: string;
    to?: string;
  }>;
  className?: string;
  trackClassName?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const visible = segments.filter((segment) => segment.value > 0);
  const aria = visible
    .map((segment) => `${segment.label} ${segment.value}`)
    .join(", ");
  const hasLinks = visible.some((segment) => Boolean(segment.to));

  return (
    <div
      className={cn(
        "flex h-2.5 overflow-hidden rounded-sm bg-muted/45",
        trackClassName,
        className
      )}
      role={hasLinks ? "group" : "img"}
      aria-label={total > 0 ? aria : "No values"}
    >
      {visible.map((segment) => {
        const width = `${(segment.value / total) * 100}%`;
        const title = `${segment.label}: ${segment.value}`;
        if (segment.to) {
          return (
            <Link
              key={segment.key}
              to={segment.to}
              className={cn("h-full min-w-[3px] hover:opacity-80", segment.className)}
              style={{ width }}
              title={title}
              aria-label={`${segment.label} tasks`}
            />
          );
        }
        return (
          <div
            key={segment.key}
            className={cn("h-full min-w-[3px]", segment.className)}
            style={{ width }}
            title={title}
          />
        );
      })}
    </div>
  );
}

export function DashboardRing({
  value,
  total,
  label,
  tone = "done",
}: {
  value: number;
  total: number;
  label: string;
  tone?: "done" | "active" | "warn";
}) {
  const size = 76;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? value / total : 0;
  const strokeColor =
    tone === "warn"
      ? "hsl(var(--status-blocked))"
      : tone === "active"
        ? "hsl(var(--status-active))"
        : "hsl(var(--status-done))";

  return (
    <div className="relative shrink-0" aria-label={`${label}: ${Math.round(percent * 100)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-[15px] font-semibold tabular-nums leading-none tracking-tight">
          {Math.round(percent * 100)}
          <span className="text-[10px] font-medium text-muted-foreground">%</span>
        </span>
      </div>
    </div>
  );
}
