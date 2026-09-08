import { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ActiveNoteHistoryItem } from "@/domain/spydr/utils/activeNoteTypes";
import { useIsPhone } from "@/hooks/useIsPhone";

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

function HistoryNoteCard({
  note,
  onOpen,
}: {
  note: ActiveNoteHistoryItem;
  onOpen?: () => void;
}) {
  const appliedCount = note.suggestions.filter(
    (suggestion) => suggestion.decision === "accepted"
  ).length;
  const suggestionCount = note.suggestions.length;
  const failedCount = note.suggestions.filter(
    (suggestion) => suggestion.decision === "failed"
  ).length;

  return (
    <li>
      <Link
        to={`/active-note/${note.id}`}
        onClick={onOpen}
        className="block rounded-md border border-border/60 bg-background/60 px-2.5 py-2 text-left transition-colors hover:border-highlight/35 hover:bg-highlight/[0.04]"
      >
        <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {formatNoteTime(note.completedAt ?? note.updatedAt)}
        </span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-foreground">
          {previewText(note.content) || "Empty note"}
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {suggestionCount === 0
            ? "No suggestions"
            : failedCount > 0
              ? `${appliedCount}/${suggestionCount} applied · ${failedCount} failed`
              : `${appliedCount}/${suggestionCount} applied`}
        </span>
      </Link>
    </li>
  );
}

function HistoryList({
  notes,
  loading,
  onOpen,
}: {
  notes: ActiveNoteHistoryItem[];
  loading: boolean;
  onOpen?: () => void;
}) {
  return (
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
            <HistoryNoteCard key={note.id} note={note} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ActiveNoteHistoryPanel({
  notes,
  loading = false,
}: ActiveNoteHistoryPanelProps) {
  const isPhone = useIsPhone();
  const [open, setOpen] = useState(false);

  if (isPhone) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute left-3 top-3 z-10 h-9 gap-1.5 bg-background/90 px-2.5 text-[12px] backdrop-blur-sm"
          onClick={() => setOpen(true)}
        >
          <History className="h-3.5 w-3.5" />
          Past notes
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="bg-muted/[0.07] p-0">
            <SheetHeader className="border-b border-border px-4 py-3 pr-12">
              <SheetTitle className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Past notes
              </SheetTitle>
              <SheetDescription className="text-[12px] leading-snug">
                Open a previous Active Note to see what was applied and apply the
                rest.
              </SheetDescription>
            </SheetHeader>
            <HistoryList
              notes={notes}
              loading={loading}
              onOpen={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside
      className="relative z-[1] flex h-full min-h-0 w-[19.5rem] shrink-0 flex-col overflow-hidden border-r border-border bg-muted/[0.07]"
      aria-label="Past notes"
    >
      <div className="shrink-0 border-b border-border px-3 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Past notes
        </p>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
          Open a previous Active Note to see what was applied and apply the rest.
        </p>
      </div>
      <HistoryList notes={notes} loading={loading} />
    </aside>
  );
}
