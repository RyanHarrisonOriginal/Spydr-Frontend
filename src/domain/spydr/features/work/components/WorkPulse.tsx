import { cn } from "@/lib/utils";

export type WorkPulseKind = "overdue" | "blocked" | "this_week";

export interface WorkPulseCounts {
  overdue: number;
  blocked: number;
  dueThisWeek: number;
}

interface WorkPulseProps {
  counts: WorkPulseCounts;
  onSelect(kind: WorkPulseKind): void;
}

export function WorkPulse({ counts, onSelect }: WorkPulseProps) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-[18px] gap-y-1 font-mono text-[13px] lowercase tracking-normal">
      <PulseSegment
        count={counts.overdue}
        label="overdue"
        danger={counts.overdue > 0}
        onClick={() => onSelect("overdue")}
      />
      <PulseSegment
        count={counts.blocked}
        label="blocked"
        onClick={() => onSelect("blocked")}
      />
      <PulseSegment
        count={counts.dueThisWeek}
        label="due this week"
        onClick={() => onSelect("this_week")}
      />
    </span>
  );
}

function PulseSegment({
  count,
  label,
  danger = false,
  onClick,
}: {
  count: number;
  label: string;
  danger?: boolean;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-baseline gap-1 rounded-sm px-0.5 transition-colors hover:bg-[var(--surface-hover)]"
    >
      <span
        className={cn(
          "tabular-nums text-[var(--fg)]",
          danger && "text-[var(--danger)]"
        )}
      >
        {count}
      </span>
      <span className="text-[var(--muted)]">{label}</span>
    </button>
  );
}
