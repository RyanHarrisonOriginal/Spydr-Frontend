import { Link } from "react-router-dom";
import type { PersonNode } from "@/domain/spydr/utils/types";
import {
  personDisplayName,
  personInitial,
  personSubtitle,
} from "@/domain/spydr/utils/projectPersonas";

interface PersonListProps {
  people: PersonNode[];
}

export function PersonList({ people }: PersonListProps) {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-[40px_minmax(220px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)] items-center gap-4 border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span />
        <span>Name</span>
        <span>Role</span>
        <span>Organization</span>
      </div>
      <ul className="divide-y divide-border">
        {people.map((person) => (
          <li key={person.id}>
            <Link
              to={`/people/${person.id}`}
              className="grid grid-cols-[40px_minmax(220px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)] items-center gap-4 px-6 py-3 row-hover"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-muted/40 font-mono text-[11px] font-medium text-foreground/80">
                {personInitial(person)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium hover:text-primary">
                  {personDisplayName(person)}
                </p>
                {person.details?.email ? (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {person.details.email}
                  </p>
                ) : null}
              </div>
              <span className="truncate text-[12px] text-foreground/85">
                {person.details?.title || "—"}
              </span>
              <span className="truncate text-[12px] text-muted-foreground">
                {person.details?.organization || "—"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PersonListCard({ person }: { person: PersonNode }) {
  const subtitle = personSubtitle(person);
  return (
    <Link
      to={`/people/${person.id}`}
      className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-background px-2 py-1.5 transition-colors hover:border-border hover:bg-muted/20"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-muted/40 font-mono text-[10px]">
        {personInitial(person)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium">
          {personDisplayName(person)}
        </span>
        {subtitle ? (
          <span className="block truncate text-[10px] text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
