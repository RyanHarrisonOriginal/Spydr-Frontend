import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AREA_COLOR_PRESETS,
  hexToHslChannels,
  hslChannelsToHex,
  hslColorCss,
} from "@/domain/spydr/utils/projectAreaColors";
import { cn } from "@/lib/utils";
import { AreaColorSwatch } from "./AreaColorSwatch";

interface AreaColorPickerProps {
  color: string;
  disabled?: boolean;
  ariaLabel: string;
  onChange(color: string): void;
}

export function AreaColorPicker({
  color,
  disabled = false,
  ariaLabel,
  onChange,
}: AreaColorPickerProps) {
  const hexValue = hslChannelsToHex(color);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "group/swatch rounded-full p-0.5 transition-colors",
            "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <AreaColorSwatch
            color={color}
            className="h-3 w-3 transition-transform group-hover/swatch:scale-105"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-[120] w-[11.5rem] border-border/90 bg-popover p-2 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="px-0.5 pb-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Area color
        </p>

        <div className="grid grid-cols-4 gap-1.5">
          {AREA_COLOR_PRESETS.map((preset) => {
            const isSelected = preset === color;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className={cn(
                  "relative flex h-7 w-7 items-center justify-center rounded-md",
                  "border border-transparent transition-colors hover:border-border/80 hover:bg-muted/40",
                  isSelected && "border-primary/30 bg-muted/30"
                )}
                aria-label={`Use color ${preset}`}
                title={preset}
              >
                <span
                  className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: hslColorCss(preset) }}
                />
                {isSelected ? (
                  <Check
                    className="absolute h-3 w-3 text-foreground drop-shadow-sm"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-2 bg-border/70" />

        <label
          className={cn(
            "flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border/80 px-2",
            "text-[11px] text-muted-foreground transition-colors hover:border-border hover:bg-muted/30"
          )}
        >
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: hslColorCss(color) }}
          />
          <span className="flex-1">Custom color</span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground/80">
            Pick
          </span>
          <input
            type="color"
            value={hexValue}
            onChange={(event) => onChange(hexToHslChannels(event.target.value))}
            className="sr-only"
            aria-label={`${ariaLabel} custom`}
          />
        </label>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
