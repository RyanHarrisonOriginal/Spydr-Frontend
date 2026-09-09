import { ListChecks, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToTodoButtonProps {
  onTodo: boolean;
  busy?: boolean;
  disabled?: boolean;
  className?: string;
  onToggle(): void;
}

export function AddToTodoButton({
  onTodo,
  busy = false,
  disabled = false,
  className,
  onToggle,
}: AddToTodoButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 shrink-0",
        onTodo
          ? "text-highlight hover:text-highlight"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={onTodo ? "Remove from today" : "Add to today"}
      title={onTodo ? "On today — click to remove" : "Add to today"}
      disabled={disabled || busy}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      {onTodo ? (
        <ListChecks className="h-3.5 w-3.5" />
      ) : (
        <ListPlus className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
