import { cn } from "@/lib/utils";

export function DashboardTickBar({
  ratio,
  tone = "default",
  className,
}: {
  ratio: number;
  tone?: "default" | "danger" | "active" | "warn" | "done";
  className?: string;
}) {
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  return (
    <span className={cn("dashboard-tick", className)} aria-hidden>
      <span
        className={cn(
          "dashboard-tick-fill",
          tone === "danger" && "dashboard-tick-fill-danger",
          tone === "active" && "dashboard-tick-fill-active",
          tone === "warn" && "dashboard-tick-fill-warn",
          tone === "done" && "dashboard-tick-fill-done"
        )}
        style={{ width }}
      />
    </span>
  );
}
