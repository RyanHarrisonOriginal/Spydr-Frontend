import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  GitBranch,
  Lightbulb,
  Link2,
  Target,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type {
  ApplyActiveNoteProposalResult,
  AppliedActiveNoteObject,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";
import { cn } from "@/lib/utils";
import { objectTypeLabel } from "../utils/proposalPresentation";

interface ActiveNoteCompletionSummaryProps {
  result: ApplyActiveNoteProposalResult;
  applyError: string | null;
  onCreateAnother(): void;
}

function objectTypeIcon(type: SpydrObjectType): LucideIcon {
  switch (type) {
    case "project":
      return FolderKanban;
    case "task":
      return ClipboardList;
    case "note":
      return FileText;
    case "decision":
      return GitBranch;
    case "idea":
      return Lightbulb;
    case "person":
      return UserRound;
    case "goal":
      return Target;
    case "relationship":
      return Link2;
    default:
      return FileText;
  }
}

export function ActiveNoteCompletionSummary({
  result,
  applyError,
  onCreateAnother,
}: ActiveNoteCompletionSummaryProps) {
  const created = result.applied.filter((item) => item.action === "created");
  const updated = result.applied.filter((item) => item.action === "updated");
  const linked = result.applied.filter((item) => item.action === "linked");
  const totalApplied = result.applied.length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
      <header className="relative overflow-hidden rounded-md border border-border bg-muted/10 px-5 py-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 0% 0%, color-mix(in oklab, var(--highlight) 18%, transparent), transparent 55%)",
          }}
          aria-hidden
        />
        <div className="relative flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-highlight/30 bg-highlight/10 text-highlight">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-highlight">
              Applied successfully
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-tight">
              Active note processed
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
              {totalApplied === 0
                ? "No objects were changed."
                : `${totalApplied} object${totalApplied === 1 ? "" : "s"} written to your workspace. Open any item below to continue.`}
            </p>
          </div>
        </div>
      </header>

      {applyError ? (
        <p className="mt-4 text-[12.5px] text-destructive" role="alert">
          {applyError}
        </p>
      ) : null}

      <div className="mt-6 space-y-5">
        <ResultGroup title="Created" items={created} />
        <ResultGroup title="Updated" items={updated} />
        <ResultGroup title="Linked" items={linked} />
      </div>

      {result.failed.length > 0 ? (
        <div className="mt-6 rounded-md border border-border bg-muted/10 p-4">
          <h3 className="text-[13px] font-semibold">Could not apply</h3>
          <ul className="mt-2 space-y-1 text-[12.5px] text-muted-foreground">
            {result.failed.map((item) => (
              <li key={item.operationId}>{item.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onCreateAnother}>
          Create another active note
        </Button>
        <Button asChild variant="ghost">
          <Link to="/notes">Return to notes</Link>
        </Button>
      </div>
    </div>
  );
}

function ResultGroup({
  title,
  items,
}: {
  title: string;
  items: AppliedActiveNoteObject[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h3>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/80">
          {items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <ResultItem key={`${item.action}-${item.id}`} item={item} />
        ))}
      </ul>
    </section>
  );
}

function ResultItem({ item }: { item: AppliedActiveNoteObject }) {
  const Icon = objectTypeIcon(item.type);
  const typeLabel = objectTypeLabel(item.type);

  return (
    <li>
      <Link
        to={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5",
          "transition-colors hover:border-highlight/40 hover:bg-highlight/[0.04]"
        )}
        aria-label={`Open ${typeLabel}: ${item.title}`}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border",
            "bg-muted/40 text-foreground/75 transition-colors",
            "group-hover:border-highlight/35 group-hover:bg-highlight/10 group-hover:text-highlight"
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {typeLabel}
          </span>
          <span className="mt-0.5 block truncate text-[14px] font-medium tracking-tight text-foreground">
            {item.title}
          </span>
        </span>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-highlight"
          aria-hidden
        />
      </Link>
    </li>
  );
}
