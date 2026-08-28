import { CheckSquare, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkViewMode } from "../hooks/useWorkScope";

const VIEW_MODES: { id: WorkViewMode; label: string; icon: typeof FolderKanban }[] = [
  { id: "hierarchy", label: "Projects", icon: FolderKanban },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
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
      className="inline-flex h-8 items-center rounded-sm border border-border bg-muted/25 p-0.5"
    >
      {VIEW_MODES.map((mode) => {
        const active = value === mode.id;
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-[12px] transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(mode.id)}
          >
            <Icon className="h-3.5 w-3.5" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
