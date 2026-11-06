import { cn } from "@/lib/utils";

export type StatusTickTone = "done" | "blocked" | "waiting" | "active";

export interface StatusTickSegment {
  key: string;
  count: number;
  tone: StatusTickTone;
  label: string;
}

interface StatusTickBarProps {
  segments: StatusTickSegment[];
  className?: string;
  /** Accessible summary; defaults to "label count" joined. */
  ariaLabel?: string;
}

const toneClass: Record<StatusTickTone, string> = {
  done: "status-tick-segment-done",
  blocked: "status-tick-segment-blocked",
  waiting: "status-tick-segment-waiting",
  active: "status-tick-segment-active",
};

/** Segmented status tick bar (done / blocked / waiting / active). */
export function StatusTickBar({
  segments,
  className,
  ariaLabel,
}: StatusTickBarProps) {
  const visible = segments.filter((segment) => segment.count > 0);
  const label =
    ariaLabel ??
    segments.map((segment) => `${segment.label} ${segment.count}`).join(", ");

  if (visible.length === 0) {
    return (
      <span
        className={cn("status-tick-bar", className)}
        role="img"
        aria-label={label || "No tasks"}
      />
    );
  }

  return (
    <span
      className={cn("status-tick-bar", className)}
      role="img"
      aria-label={label}
    >
      {visible.map((segment) => (
        <span
          key={segment.key}
          className={cn("status-tick-segment", toneClass[segment.tone])}
          style={{ flex: segment.count }}
        />
      ))}
    </span>
  );
}
