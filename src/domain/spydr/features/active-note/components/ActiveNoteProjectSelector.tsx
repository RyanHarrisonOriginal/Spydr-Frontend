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
  label = "Attach to project",
}: ActiveNoteProjectSelectorProps) {
  const groupName = `active-note-project-${options.map((o) => o.id).join("-")}`;

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-[12px] font-medium text-muted-foreground">
        {label}
      </legend>
      <div className="space-y-1.5">
        {options.map((option) => {
          const checked = value === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 transition-colors",
                checked
                  ? "border-highlight/40 bg-highlight/5"
                  : "border-border hover:border-border/80 hover:bg-muted/20"
              )}
            >
              <input
                type="radio"
                name={groupName}
                className="mt-1"
                checked={checked}
                onChange={() => onChange(option.id)}
                disabled={disabled}
              />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-foreground">
                  {option.title}
                </span>
                {option.relevanceReason ? (
                  <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                    {option.relevanceReason}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
        {allowUnassigned ? (
          <label
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 transition-colors",
              value == null
                ? "border-highlight/40 bg-highlight/5"
                : "border-border hover:border-border/80 hover:bg-muted/20"
            )}
          >
            <input
              type="radio"
              name={groupName}
              className="mt-1"
              checked={value == null}
              onChange={() => onChange(null)}
              disabled={disabled}
            />
            <span className="text-[13px] font-medium text-foreground">
              Leave unassigned
            </span>
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}
