import { Link } from "react-router-dom";
import type { PersonNode } from "@/domain/spydr/utils/types";
import { ProjectListFieldSelect } from "@/domain/spydr/features/projects/components/ProjectListFieldSelect";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import {
  PersonAvatar,
  PersonNameFit,
  personSelectLabel,
} from "@/domain/spydr/features/people/components/PersonIdentity";
import { personSubtitle } from "@/domain/spydr/utils/projectPersonas";
import { workPersonPath } from "@/domain/spydr/features/work/utils/workPaths";
import { cn } from "@/lib/utils";

interface PersonSelectProps {
  people: PersonNode[];
  value: string | null;
  onChange(personNodeId: string | null): void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  triggerClassName?: string;
  compact?: boolean;
  /** Size the trigger to the selected name instead of filling the parent. */
  fitContent?: boolean;
  /** Wrap the selected name instead of truncating. */
  wrapLabel?: boolean;
  /** Narrow slots show initials instead of the given name. */
  whenTight?: "given" | "initials";
  hideChevron?: boolean;
}

export function PersonSelect({
  people,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  className,
  triggerClassName,
  compact = false,
  fitContent = false,
  wrapLabel = false,
  whenTight = "given",
  hideChevron = false,
}: PersonSelectProps) {
  const { currentUserPersonId, isMe } = useCurrentUserPerson();
  const selected = people.find((person) => person.id === value) ?? null;
  const options = [
    { value: "", label: "Unassigned" },
    ...people.map((person) => ({
      value: person.id,
      label: personSelectLabel(person, currentUserPersonId),
    })),
  ];

  return (
    <div className={cn(fitContent ? "w-auto" : "min-w-0", className)}>
      <ProjectListFieldSelect
        value={value ?? ""}
        options={options}
        onChange={(next) => onChange(next || null)}
        disabled={disabled}
        ariaLabel={ariaLabel}
        menuLabel="People"
        emptyValue=""
        searchable
        fitContent={fitContent}
        wrapLabel={wrapLabel}
        hideChevron={hideChevron}
        title={
          selected
            ? personSelectLabel(selected, currentUserPersonId)
            : undefined
        }
        triggerLabel={
          compact && !fitContent && selected ? (
            <PersonNameFit person={selected} whenTight={whenTight} />
          ) : undefined
        }
        leading={
          selected ? (
            <PersonAvatar person={selected} size="sm" />
          ) : (
            <PersonAvatar person={null} size="sm" />
          )
        }
        renderOptionLeading={(option) => {
          const person = people.find((item) => item.id === option.value);
          if (!person) return <PersonAvatar person={null} size="sm" />;
          return <PersonAvatar person={person} size="sm" />;
        }}
        triggerClassName={triggerClassName}
        labelClassName="text-[length:var(--pl-control-size,0.8125rem)] text-foreground/90"
        getOptionLabelClassName={() =>
          "text-[length:var(--pl-control-size,0.8125rem)]"
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
            to={workPersonPath(selected.id)}
            className="shrink-0 text-[10px] text-primary hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {isMe(selected) ? "Your work" : "View work"}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
