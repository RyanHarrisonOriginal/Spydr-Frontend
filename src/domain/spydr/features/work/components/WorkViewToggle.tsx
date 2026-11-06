import { cn } from "@/lib/utils";
import type { WorkViewMode } from "../hooks/useWorkScope";

const VIEW_MODES: { id: WorkViewMode; label: string }[] = [
  { id: "hierarchy", label: "Projects" },
  { id: "tasks", label: "Tasks" },
];

interface WorkViewToggleProps {
  value: WorkViewMode;
  onChange(mode: WorkViewMode): void;
}

export function WorkViewToggle({ value, onChange }: WorkViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Work view"
      className="inline-flex h-[30px] items-center rounded-lg border border-[#1A1D23] bg-[var(--control)] p-0.5"
    >
      {VIEW_MODES.map((mode) => {
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex h-full items-center rounded-md px-2.5 text-[12px] transition-colors",
              active
                ? "bg-[#1A1E25] text-[var(--fg)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            )}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
