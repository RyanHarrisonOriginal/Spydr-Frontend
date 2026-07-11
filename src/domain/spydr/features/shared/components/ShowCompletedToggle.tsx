import { Button } from "@/components/ui/button";

interface ShowCompletedToggleProps {
  showCompleted: boolean;
  completedCount: number;
  onChange(show: boolean): void;
}

export function ShowCompletedToggle({
  showCompleted,
  completedCount,
  onChange,
}: ShowCompletedToggleProps) {
  if (completedCount === 0) return null;

  return (
    <Button
      type="button"
      variant={showCompleted ? "secondary" : "outline"}
      size="sm"
      className="h-7 gap-1 px-2 font-mono text-[10px] uppercase tracking-wider"
      aria-pressed={showCompleted}
      onClick={() => onChange(!showCompleted)}
    >
      {showCompleted ? "Hide completed" : `Show completed (${completedCount})`}
    </Button>
  );
}
