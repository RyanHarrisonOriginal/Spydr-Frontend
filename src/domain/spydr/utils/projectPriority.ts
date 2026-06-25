import type { SpydrPriority } from "@/domain/spydr/utils/types";

/** Canonical priorities for project nodes — keep in sync with backend. */
export const projectPriorities = ["low", "medium", "high", "critical"] as const;

export type ProjectPriority = (typeof projectPriorities)[number];

export function isProjectPriority(priority: string): priority is SpydrPriority {
  return (projectPriorities as readonly string[]).includes(priority);
}

export const prioritySurface: Record<string, string> = {
  critical:
    "border-[hsl(var(--priority-critical)/0.35)] bg-[hsl(var(--priority-critical)/0.08)] text-[hsl(var(--priority-critical))]",
  high:
    "border-[hsl(var(--priority-high)/0.35)] bg-[hsl(var(--priority-high)/0.08)] text-[hsl(var(--priority-high))]",
  medium:
    "border-[hsl(var(--priority-medium)/0.35)] bg-[hsl(var(--priority-medium)/0.08)] text-[hsl(var(--priority-medium))]",
  low:
    "border-[hsl(var(--priority-low)/0.35)] bg-[hsl(var(--priority-low)/0.08)] text-[hsl(var(--priority-low))]",
};

export const priorityOptionSurface: Record<string, string> = {
  critical:
    "focus:bg-[hsl(var(--priority-critical)/0.14)] data-[highlighted]:bg-[hsl(var(--priority-critical)/0.14)]",
  high:
    "focus:bg-[hsl(var(--priority-high)/0.14)] data-[highlighted]:bg-[hsl(var(--priority-high)/0.14)]",
  medium:
    "focus:bg-[hsl(var(--priority-medium)/0.14)] data-[highlighted]:bg-[hsl(var(--priority-medium)/0.14)]",
  low:
    "focus:bg-[hsl(var(--priority-low)/0.14)] data-[highlighted]:bg-[hsl(var(--priority-low)/0.14)]",
};

export const priorityMarker: Record<string, string> = {
  critical: "bg-[hsl(var(--priority-critical))]",
  high: "bg-[hsl(var(--priority-high))]",
  medium: "bg-[hsl(var(--priority-medium))]",
  low: "bg-[hsl(var(--priority-low))]",
};
