import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShowCompletedToggleProps {
  showCompleted: boolean;
  completedCount: number;
  onChange(show: boolean): void;
  className?: string;
}

export function ShowCompletedToggle({
  showCompleted,
  completedCount,
  onChange,
  className,
}: ShowCompletedToggleProps) {
  if (completedCount === 0) return null;

  return (
    <Button
      type="button"
      variant={showCompleted ? "secondary" : "outline"}
      size="sm"
      className={cn(
        "h-8 gap-1.5 px-2.5 font-mono text-[10px] uppercase tracking-wider",
        className
      )}
      aria-pressed={showCompleted}
      aria-label={
        showCompleted
          ? `Hide ${completedCount} completed tasks`
          : `Show ${completedCount} completed tasks`
      }
      onClick={() => onChange(!showCompleted)}
    >
      <span className="grid justify-items-start">
        <span className={cn("col-start-1 row-start-1", !showCompleted && "invisible")}>
          Hide completed
        </span>
        <span className={cn("col-start-1 row-start-1", showCompleted && "invisible")}>
          Show completed
        </span>
      </span>
      <span className="tabular-nums text-muted-foreground">{completedCount}</span>
    </Button>
  );
}
