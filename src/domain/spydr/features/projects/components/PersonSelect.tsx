import { Link } from "react-router-dom";
import type { PersonNode } from "@/domain/spydr/utils/types";
import { ProjectListFieldSelect } from "@/domain/spydr/features/projects/components/ProjectListFieldSelect";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import {
  PersonAvatar,
  personSelectLabel,
} from "@/domain/spydr/features/people/components/PersonIdentity";
import { personSubtitle } from "@/domain/spydr/utils/projectPersonas";
import { cn } from "@/lib/utils";

interface PersonSelectProps {
  people: PersonNode[];
  value: string | null;
  onChange(personNodeId: string | null): void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  compact?: boolean;
}

export function PersonSelect({
  people,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  className,
  compact = false,
}: PersonSelectProps) {
  const { isMe } = useCurrentUserPerson();
  const selected = people.find((person) => person.id === value) ?? null;
  const options = [
    { value: "", label: "Unassigned" },
    ...people.map((person) => ({
      value: person.id,
      label: personSelectLabel(person, isMe),
    })),
  ];

  return (
    <div className={cn("min-w-0", className)}>
      <ProjectListFieldSelect
        value={value ?? ""}
        options={options}
        onChange={(next) => onChange(next || null)}
        disabled={disabled}
        ariaLabel={ariaLabel}
        menuLabel="People"
        emptyValue=""
        leading={
          selected ? (
            <PersonAvatar person={selected} size="sm" className="h-4 w-4 text-[8px]" />
          ) : (
            <span className="h-4 w-4 shrink-0 rounded-full border border-dashed border-border/80 bg-muted/20" />
          )
        }
        renderOptionLeading={(option) => {
          const person = people.find((item) => item.id === option.value);
          if (!person) return <span className="h-4 w-4 shrink-0" />;
          return (
            <PersonAvatar person={person} size="sm" className="h-4 w-4 text-[8px]" />
          );
        }}
        triggerClassName={cn(
          "h-8 bg-background",
          selected && isMe(selected) && "border-highlight/35 bg-highlight/5"
        )}
        labelClassName={cn(
          "text-[12px] text-foreground/90",
          selected && isMe(selected) && "text-highlight"
        )}
        getOptionLabelClassName={(option, _selected) =>
          cn("text-[12px]", option.value && isMe(option.value) && "text-highlight")
        }
      />
      {!compact && selected ? (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {personSubtitle(selected) ? (
            <p className="min-w-0 truncate text-[10px] text-muted-foreground">
              {personSubtitle(selected)}
            </p>
          ) : (
            <span />
          )}
          <Link
            to={`/people/${selected.id}`}
            className="shrink-0 text-[10px] text-primary hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {isMe(selected) ? "Your profile" : "View profile"}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
