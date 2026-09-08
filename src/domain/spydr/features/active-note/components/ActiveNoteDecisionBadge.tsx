import { Check, Clock, RotateCcw, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { ActiveNoteHistoryDecision } from "@/domain/spydr/utils/activeNoteTypes";
import { cn } from "@/lib/utils";

export function activeNoteDecisionLabel(
  decision: ActiveNoteHistoryDecision
): string {
  switch (decision) {
    case "accepted":
      return "Applied";
    case "rejected":
      return "Not applied";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
}

export function ActiveNoteDecisionBadge({
  decision,
  href,
}: {
  decision: ActiveNoteHistoryDecision;
  href?: string | null;
}) {
  const label = activeNoteDecisionLabel(decision);
  const className = cn(
    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
    decision === "accepted" && "bg-highlight/15 text-highlight",
    decision === "rejected" && "bg-muted text-muted-foreground",
    decision === "failed" && "bg-destructive/10 text-destructive",
    decision === "pending" && "bg-muted/60 text-muted-foreground"
  );
  const icon =
    decision === "accepted" ? (
      <Check className="h-2.5 w-2.5" aria-hidden />
    ) : decision === "rejected" ? (
      <X className="h-2.5 w-2.5" aria-hidden />
    ) : decision === "failed" ? (
      <RotateCcw className="h-2.5 w-2.5" aria-hidden />
    ) : (
      <Clock className="h-2.5 w-2.5" aria-hidden />
    );

  if (decision === "accepted" && href) {
    return (
      <Link
        to={href}
        className={cn(className, "hover:bg-highlight/25")}
        onClick={(event) => event.stopPropagation()}
      >
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <span className={className}>
      {icon}
      {label}
    </span>
  );
}
