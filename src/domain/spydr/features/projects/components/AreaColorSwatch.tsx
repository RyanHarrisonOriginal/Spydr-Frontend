import { cn } from "@/lib/utils";
import { hslColorCss } from "@/domain/spydr/utils/projectAreaColors";

interface AreaColorSwatchProps {
  color: string;
  className?: string;
  selected?: boolean;
}

export function AreaColorSwatch({
  color,
  className,
  selected = false,
}: AreaColorSwatchProps) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-black/10 shadow-sm",
        selected && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background",
        className
      )}
      style={{ backgroundColor: hslColorCss(color) }}
      aria-hidden
    />
  );
}
