import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { PersonNode } from "@/domain/spydr/utils/types";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import {
  PersonAvatar,
  PersonMeBadge,
} from "@/domain/spydr/features/people/components/PersonIdentity";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { cn } from "@/lib/utils";

interface WorkPersonFilterProps {
  people: PersonNode[];
  selectedPersonId: string | null;
  pending?: boolean;
  onSelect(personId: string | null): void;
}

function PersonChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick(): void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-sm px-2 text-[12px] transition-colors",
        selected
          ? "bg-background text-foreground shadow-sm ring-1 ring-highlight/35"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function WorkPersonFilter({
  people,
  selectedPersonId,
  pending = false,
  onSelect,
}: WorkPersonFilterProps) {
  const { isMe } = useCurrentUserPerson();

  const orderedPeople = [...people].sort((left, right) => {
    const leftIsMe = isMe(left);
    const rightIsMe = isMe(right);
    if (leftIsMe && !rightIsMe) return -1;
    if (!leftIsMe && rightIsMe) return 1;
    return personDisplayName(left).localeCompare(personDisplayName(right));
  });

  const selectedPerson =
    people.find((person) => person.id === selectedPersonId) ?? null;

  return (
    <div
      role="tablist"
      aria-label="Filter by person"
      className="inline-flex min-w-0 max-w-full items-center gap-0.5 overflow-x-auto rounded-sm border border-border bg-muted/25 p-0.5"
    >
      <PersonChip
        selected={!pending && !selectedPersonId}
        onClick={() => onSelect(null)}
      >
        All
      </PersonChip>
      {orderedPeople.map((person) => {
        const selected = !pending && selectedPersonId === person.id;
        return (
          <span key={person.id} className="inline-flex shrink-0 items-center">
            <PersonChip selected={selected} onClick={() => onSelect(person.id)}>
              <PersonAvatar person={person} size="sm" className="h-4 w-4 text-[8px]" />
              <span className="max-w-[8rem] truncate">{personDisplayName(person)}</span>
              {isMe(person) ? <PersonMeBadge compact /> : null}
            </PersonChip>
            {selected && selectedPerson ? (
              <Link
                to={`/people/${selectedPerson.id}`}
                aria-label={
                  isMe(selectedPerson) ? "Open your profile" : "Open profile"
                }
                className="mr-0.5 grid h-6 w-6 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
