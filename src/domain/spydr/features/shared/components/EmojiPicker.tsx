import { Smile, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EMOJI_PRESETS, normalizeEmojiInput } from "@/domain/spydr/utils/emoji";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  value: string | null | undefined;
  disabled?: boolean;
  ariaLabel: string;
  size?: "sm" | "md";
  onChange(emoji: string | null): void;
}

export function EmojiPicker({
  value,
  disabled = false,
  ariaLabel,
  size = "sm",
  onChange,
}: EmojiPickerProps) {
  const [custom, setCustom] = useState("");
  const emoji = value ?? null;

  const commitCustom = () => {
    const next = normalizeEmojiInput(custom);
    if (!next) return;
    onChange(next);
    setCustom("");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "grid shrink-0 place-items-center rounded-md transition-colors",
            "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            size === "md" ? "h-9 w-9 text-lg" : "h-7 w-7 text-sm"
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {emoji ? (
            <span aria-hidden className="leading-none">
              {emoji}
            </span>
          ) : (
            <Smile
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/70",
                size === "md" && "h-4 w-4"
              )}
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-[120] w-[18rem] overflow-x-hidden border-border/90 bg-popover p-2 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="px-0.5 pb-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Emoji
        </p>

        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_PRESETS.map((preset) => {
            const isSelected = preset === emoji;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-md text-base leading-none",
                  "transition-colors hover:bg-muted/60",
                  isSelected && "bg-muted"
                )}
                aria-label={`Use ${preset}`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-2 bg-border/70" />

        <div className="flex items-center gap-1.5">
          <input
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitCustom();
              }
            }}
            placeholder="Paste emoji"
            aria-label={`${ariaLabel} custom`}
            className="h-8 min-w-0 flex-1 rounded-md border border-border/80 bg-transparent px-2 text-[12px] outline-none ring-focus placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={!emoji}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            aria-label="Remove emoji"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
