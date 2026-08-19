import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Clock, X } from "lucide-react";
import type {
  ActiveNoteHistoryDecision,
  ActiveNoteHistoryItem,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";
import { cn } from "@/lib/utils";
import { objectTypeLabel } from "../utils/proposalPresentation";

interface ActiveNoteHistoryPanelProps {
  notes: ActiveNoteHistoryItem[];
  loading?: boolean;
}

function formatNoteTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function previewText(content: string): string {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= 120) return compact;
  return `${compact.slice(0, 117).trimEnd()}…`;
}

function decisionLabel(decision: ActiveNoteHistoryDecision): string {
  switch (decision) {
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
}

function DecisionBadge({ decision }: { decision: ActiveNoteHistoryDecision }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
        decision === "accepted" && "bg-highlight/15 text-highlight",
        decision === "rejected" && "bg-muted text-muted-foreground",
        decision === "failed" && "bg-destructive/10 text-destructive",
        decision === "pending" && "bg-muted/60 text-muted-foreground"
      )}
    >
      {decision === "accepted" ? (
        <Check className="h-2.5 w-2.5" aria-hidden />
      ) : decision === "rejected" ? (
        <X className="h-2.5 w-2.5" aria-hidden />
      ) : (
        <Clock className="h-2.5 w-2.5" aria-hidden />
      )}
      {decisionLabel(decision)}
    </span>
  );
}

function HistoryNoteCard({ note }: { note: ActiveNoteHistoryItem }) {
  const [open, setOpen] = useState(false);
  const acceptedCount = note.suggestions.filter(
    (suggestion) => suggestion.decision === "accepted"
  ).length;
  const suggestionCount = note.suggestions.length;

  return (
    <li className="rounded-md border border-border/60 bg-background/60">
      <button
        type="button"
        className="flex w-full items-start gap-1.5 px-2.5 py-2 text-left"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="mt-0.5 text-muted-foreground">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {formatNoteTime(note.completedAt ?? note.updatedAt)}
          </span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-foreground">
            {previewText(note.content) || "Empty note"}
          </span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {suggestionCount === 0
              ? "No suggestions"
              : `${acceptedCount}/${suggestionCount} accepted`}
          </span>
        </span>
      </button>

      {open ? (
        <ul className="space-y-1.5 border-t border-border/50 px-2.5 py-2">
          {note.suggestions.length === 0 ? (
            <li className="text-[12px] text-muted-foreground">
              Nothing was suggested for this note.
            </li>
          ) : (
            note.suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="flex items-start justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-foreground">
                    {suggestion.title}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {objectTypeLabel(
                      (suggestion.objectType ?? undefined) as
                        | SpydrObjectType
                        | undefined
                    )}
                  </span>
                </span>
                <DecisionBadge decision={suggestion.decision} />
              </li>
            ))
          )}
        </ul>
      ) : null}
    </li>
  );
}

export function ActiveNoteHistoryPanel({
  notes,
  loading = false,
}: ActiveNoteHistoryPanelProps) {
  return (
    <aside
      className="relative z-[1] flex h-full min-h-0 w-[19.5rem] shrink-0 flex-col overflow-hidden border-r border-border/70 bg-muted/[0.07]"
      aria-label="Past notes"
    >
      <div className="shrink-0 border-b border-border/60 px-3 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Past notes
        </p>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
          Previous Active Notes and whether each suggestion was accepted.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <p className="px-2 py-3 text-[12px] text-muted-foreground">
            Loading past notes…
          </p>
        ) : notes.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-muted-foreground">
            Analyzed notes will show up here.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <HistoryNoteCard key={note.id} note={note} />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
