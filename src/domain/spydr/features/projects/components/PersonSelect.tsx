import { Link } from "react-router-dom";
import type { PersonNode } from "@/domain/spydr/utils/types";
import { ProjectListFieldSelect } from "@/domain/spydr/features/projects/components/ProjectListFieldSelect";
import {
  personDisplayName,
  personInitial,
  personSubtitle,
} from "@/domain/spydr/utils/projectPersonas";
import { cn } from "@/lib/utils";

interface PersonSelectProps {
  people: PersonNode[];
  value: string | null;
  onChange(personNodeId: string | null): void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}

export function PersonSelect({
  people,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: PersonSelectProps) {
  const selected = people.find((person) => person.id === value) ?? null;
  const options = [
    { value: "", label: "Unassigned" },
    ...people.map((person) => ({
      value: person.id,
      label: personDisplayName(person),
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
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border bg-muted/50 font-mono text-[8px]">
              {personInitial(selected)}
            </span>
          ) : (
            <span className="h-4 w-4 shrink-0 rounded-full border border-dashed border-border/80 bg-muted/20" />
          )
        }
        renderOptionLeading={(option) => {
          const person = people.find((item) => item.id === option.value);
          if (!person) return <span className="h-4 w-4 shrink-0" />;
          return (
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border bg-muted/50 font-mono text-[8px]">
              {personInitial(person)}
            </span>
          );
        }}
        triggerClassName="h-8 bg-background"
        labelClassName="text-[12px] text-foreground/90"
        getOptionLabelClassName={() => "text-[12px]"}
      />
      {selected ? (
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
            View profile
          </Link>
        </div>
      ) : null}
    </div>
  );
}
