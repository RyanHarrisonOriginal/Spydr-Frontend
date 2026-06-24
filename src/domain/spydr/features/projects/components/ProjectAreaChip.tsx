import { X } from "lucide-react";
import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import { resolveAreaColor } from "@/domain/spydr/utils/projectAreaColors";
import { cn } from "@/lib/utils";
import { AreaColorPicker } from "./AreaColorPicker";

interface ProjectAreaChipProps {
  area: ProjectAreaNode;
  disabled?: boolean;
  onColorChange(areaId: string, color: string): void;
  onRemove(area: ProjectAreaNode): void;
}

export function ProjectAreaChip({
  area,
  disabled = false,
  onColorChange,
  onRemove,
}: ProjectAreaChipProps) {
  const color = resolveAreaColor(area);

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
      <span className="min-w-0 truncate px-0.5 font-medium">{area.title}</span>
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
