import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Search, Users } from "lucide-react";
import type { PersonNode } from "@/domain/spydr/utils/types";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import {
  PersonAvatar,
  PersonMeBadge,
} from "@/domain/spydr/features/people/components/PersonIdentity";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface WorkPersonPickerProps {
  people: PersonNode[];
  selectedPersonId: string | null;
  pending?: boolean;
  onSelect(personId: string | null): void;
  onAddPerson(): void;
}

function matchesQuery(person: PersonNode, query: string) {
  if (!query) return true;
  const haystack = [
    personDisplayName(person),
    person.details?.email,
    person.details?.title,
    person.details?.organization,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function WorkPersonPicker({
  people,
  selectedPersonId,
  pending = false,
  onSelect,
  onAddPerson,
}: WorkPersonPickerProps) {
  const { isMe } = useCurrentUserPerson();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedPerson =
    people.find((person) => person.id === selectedPersonId) ?? null;
  const normalizedQuery = query.trim().toLowerCase();

  const orderedPeople = useMemo(() => {
    return [...people]
      .filter((person) => matchesQuery(person, normalizedQuery))
      .sort((left, right) => {
        const leftIsMe = isMe(left);
        const rightIsMe = isMe(right);
        if (leftIsMe && !rightIsMe) return -1;
        if (!leftIsMe && rightIsMe) return 1;
        return personDisplayName(left).localeCompare(personDisplayName(right));
      });
  }, [isMe, normalizedQuery, people]);

  const label = pending
    ? "Your work"
    : selectedPerson
      ? personDisplayName(selectedPerson)
      : "Everyone";

  const choose = (personId: string | null) => {
    onSelect(personId);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 max-w-[12rem] items-center gap-1.5 rounded-sm border border-border bg-muted/20 px-2 text-[12px] text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
      >
        {selectedPerson ? (
          <PersonAvatar person={selectedPerson} size="sm" className="h-4 w-4 text-[8px]" />
        ) : (
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="min-w-0 truncate">{label}</span>
        {selectedPerson && isMe(selectedPerson) ? <PersonMeBadge compact /> : null}
        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="gap-3 p-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Whose work</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people…"
              className="h-8 pl-8 text-[13px] shadow-none"
              autoFocus
            />
          </div>
          <div className="max-h-[min(24rem,50vh)] space-y-0.5 overflow-y-auto">
            {!normalizedQuery ? (
              <button
                type="button"
                onClick={() => choose(null)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-muted/50",
                  !selectedPersonId && "bg-muted/40"
                )}
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Everyone</span>
                {!selectedPersonId ? (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    All
                  </span>
                ) : null}
              </button>
            ) : null}
            {orderedPeople.length === 0 ? (
              <p className="px-2 py-6 text-center text-[12px] text-muted-foreground">
                No people match “{query.trim()}”
              </p>
            ) : (
              orderedPeople.map((person) => {
                const selected = selectedPersonId === person.id;
                return (
                  <div
                    key={person.id}
                    className={cn(
                      "flex items-center gap-1 rounded-sm pr-1",
                      selected && "bg-muted/40"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => choose(person.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-[13px]"
                    >
                      <PersonAvatar person={person} size="sm" />
                      <span className="min-w-0 flex-1 truncate">
                        {personDisplayName(person)}
                      </span>
                      {isMe(person) ? <PersonMeBadge compact /> : null}
                    </button>
                    <Link
                      to={`/people/${person.id}`}
                      onClick={() => setOpen(false)}
                      aria-label="Open profile"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-end border-t border-border/60 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[12px]"
              onClick={() => {
                setOpen(false);
                onAddPerson();
              }}
            >
              Add person
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
