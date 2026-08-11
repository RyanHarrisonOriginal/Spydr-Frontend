import type { DuplicateResolution, RelatedSpydrObject } from "@/domain/spydr/utils/activeNoteTypes";
import { cn } from "@/lib/utils";

interface ActiveNoteDuplicateResolverProps {
  existing: RelatedSpydrObject;
  value: DuplicateResolution | null | undefined;
  onChange(resolution: DuplicateResolution): void;
  disabled?: boolean;
}

export function ActiveNoteDuplicateResolver({
  existing,
  value,
  onChange,
  disabled = false,
}: ActiveNoteDuplicateResolverProps) {
  const typeLabel = existing.type;
  const options: Array<{ value: DuplicateResolution; label: string }> = [
    {
      value: "attach_existing",
      label: `Use existing “${existing.title}”`,
    },
    {
      value: "create_new",
      label: "Create new anyway",
    },
    {
      value: "ignore",
      label: "Skip",
    },
  ];

  return (
    <fieldset className="space-y-1.5" disabled={disabled}>
      <legend className="text-[12px] text-muted-foreground">
        Similar to an existing {typeLabel}
      </legend>
      <div className="space-y-1" role="radiogroup" aria-label="Duplicate resolution">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px]",
                checked
                  ? "border-highlight/40 bg-highlight/5 font-medium"
                  : "border-border/70 hover:bg-muted/20"
              )}
            >
              <input
                type="radio"
                name={`duplicate-${existing.id}`}
                checked={checked}
                onChange={() => onChange(option.value)}
                disabled={disabled}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
