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
  const options: Array<{
    value: DuplicateResolution;
    label: string;
    description: string;
  }> = [
    {
      value: "attach_existing",
      label: `Use the existing ${typeLabel} instead`,
      description: `Keep “${existing.title}” and attach this note’s context to it.`,
    },
    {
      value: "create_new",
      label: `Create a new ${typeLabel} anyway`,
      description: "Treat this as a separate item, not a duplicate.",
    },
    {
      value: "ignore",
      label: "Skip this suggestion",
      description: "Do not create or attach anything for this item.",
    },
  ];

  return (
    <fieldset className="space-y-2 rounded-md border border-border bg-muted/10 p-3" disabled={disabled}>
      <legend className="px-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Looks similar to an existing {typeLabel}
      </legend>
      <p className="text-[13px] font-medium text-foreground">{existing.title}</p>
      {existing.relevanceReason ? (
        <p className="text-[11.5px] text-muted-foreground">{existing.relevanceReason}</p>
      ) : null}
      <div className="mt-2 space-y-1.5" role="radiogroup" aria-label="Duplicate resolution">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2",
                checked
                  ? "border-highlight/40 bg-highlight/5"
                  : "border-border/70 hover:bg-muted/20"
              )}
            >
              <input
                type="radio"
                name={`duplicate-${existing.id}`}
                className="mt-1"
                checked={checked}
                onChange={() => onChange(option.value)}
                disabled={disabled}
              />
              <span>
                <span className="block text-[12.5px] font-medium">{option.label}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
