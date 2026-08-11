import type { RelatedSpydrObject } from "@/domain/spydr/utils/activeNoteTypes";
import { cn } from "@/lib/utils";

interface ActiveNoteProjectSelectorProps {
  options: RelatedSpydrObject[];
  value: string | null;
  onChange(projectId: string | null): void;
  allowUnassigned?: boolean;
  disabled?: boolean;
  label?: string;
}

export function ActiveNoteProjectSelector({
  options,
  value,
  onChange,
  allowUnassigned = true,
  disabled = false,
  label = "Project",
}: ActiveNoteProjectSelectorProps) {
  const groupName = `active-note-project-${options.map((o) => o.id).join("-")}`;

  return (
    <fieldset className="space-y-1.5" disabled={disabled}>
      <legend className="text-[12px] text-muted-foreground">{label}</legend>
      <div className="space-y-1">
        {options.map((option) => {
          const checked = value === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors",
                checked
                  ? "border-highlight/40 bg-highlight/5 font-medium"
                  : "border-border hover:bg-muted/20"
              )}
            >
              <input
                type="radio"
                name={groupName}
                checked={checked}
                onChange={() => onChange(option.id)}
                disabled={disabled}
              />
              <span className="min-w-0 truncate">{option.title}</span>
            </label>
          );
        })}
        {allowUnassigned ? (
          <label
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors",
              value == null
                ? "border-highlight/40 bg-highlight/5 font-medium"
                : "border-border hover:bg-muted/20"
            )}
          >
            <input
              type="radio"
              name={groupName}
              checked={value == null}
              onChange={() => onChange(null)}
              disabled={disabled}
            />
            No project
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}
