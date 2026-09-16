import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import { resolveAreaColor } from "@/domain/spydr/utils/projectAreaColors";
import { cn } from "@/lib/utils";
import { AreaColorPicker } from "./AreaColorPicker";

interface ProjectAreaChipProps {
  area: ProjectAreaNode;
  disabled?: boolean;
  onColorChange(areaId: string, color: string): void;
  onTitleChange(area: ProjectAreaNode, title: string): Promise<void> | void;
  onRemove(area: ProjectAreaNode): void;
}

export function ProjectAreaChip({
  area,
  disabled = false,
  onColorChange,
  onTitleChange,
  onRemove,
}: ProjectAreaChipProps) {
  const color = resolveAreaColor(area);
  const [draft, setDraft] = useState(area.title);

  useEffect(() => {
    setDraft(area.title);
  }, [area.title]);

  const commitTitle = async () => {
    const next = draft.trim();
    if (!next) {
      setDraft(area.title);
      return;
    }
    if (next === area.title) {
      setDraft(area.title);
      return;
    }

    try {
      await onTitleChange(area, next);
    } catch {
      setDraft(area.title);
    }
  };

  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-full items-center gap-1 rounded-md border border-border/70",
        "bg-muted/25 pl-1 pr-0.5 text-[11px] text-foreground/85"
      )}
    >
      <AreaColorPicker
        color={color}
        disabled={disabled}
        ariaLabel={`Color for ${area.title}`}
        onChange={(nextColor) => onColorChange(area.id, nextColor)}
      />
      <input
        value={draft}
        disabled={disabled}
        aria-label={`Area name for ${area.title}`}
        size={Math.max(draft.length, 4)}
        className={cn(
          "min-w-[3.5rem] max-w-[12rem] bg-transparent px-0.5 font-medium",
          "outline-none rounded-sm",
          "focus:bg-canvas/80 focus:ring-1 focus:ring-highlight/30",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          void commitTitle();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setDraft(area.title);
            event.currentTarget.blur();
          }
        }}
      />
      <button
        type="button"
        onClick={() => onRemove(area)}
        disabled={disabled}
        className="rounded p-1 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        aria-label={`Remove ${area.title}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
