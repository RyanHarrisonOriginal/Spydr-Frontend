import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveNoteWarningProps {
  message: string;
  className?: string;
}

export function ActiveNoteWarning({ message, className }: ActiveNoteWarningProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-[12.5px] text-muted-foreground",
        className
      )}
    >
      <AlertTriangle
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/70"
        aria-hidden
      />
      <span>{message}</span>
    </div>
  );
}
