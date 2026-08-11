import { Fragment, type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ProjectListFieldOption {
  value: string;
  label: string;
}

const SEARCH_OPTION_THRESHOLD = 6;

interface ProjectListFieldSelectProps {
  value: string;
  options: ProjectListFieldOption[];
  onChange(value: string): void;
  disabled?: boolean;
  ariaLabel: string;
  placeholder?: string;
  leading?: ReactNode;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  labelClassName?: string;
  emptyValue?: string;
  menuLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  renderOptionLeading?(option: ProjectListFieldOption): ReactNode;
  getOptionClassName?(option: ProjectListFieldOption, selected: boolean): string | undefined;
  getOptionLabelClassName?(option: ProjectListFieldOption, selected: boolean): string | undefined;
  getOptionStyle?(option: ProjectListFieldOption, selected: boolean): CSSProperties | undefined;
}

export function ProjectListFieldSelect({
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
  placeholder = "Select…",
  leading,
  triggerClassName,
  triggerStyle,
  labelClassName,
  emptyValue = "",
  menuLabel,
  searchable,
  searchPlaceholder = "Search…",
  renderOptionLeading,
  getOptionClassName,
  getOptionLabelClassName,
  getOptionStyle,
}: ProjectListFieldSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const showSearch = searchable ?? options.length > SEARCH_OPTION_THRESHOLD;

  const selected = options.find((option) => option.value === value);
  const displayLabel = selected?.label ?? placeholder;
  const isEmpty = !value || value === emptyValue;

  const visibleOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!showSearch || !query) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery, showSearch]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }
    if (!showSearch) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, showSearch]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearchQuery("");
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className={cn(
            "flex h-7 w-full min-w-0 items-center gap-1.5 rounded-md border px-2",
            "border-border/80 bg-background/50 text-[11px] transition-colors",
            "hover:border-border hover:bg-muted/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/15",
            isEmpty && "border-dashed bg-muted/20",
            triggerClassName
          )}
          style={triggerStyle}
        >
          {leading}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left leading-none",
              isEmpty ? "italic text-muted-foreground" : labelClassName
            )}
          >
            {displayLabel}
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-muted-foreground/70 transition-transform",
              open && "rotate-180 text-foreground"
            )}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-[120] w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden border-border/90 bg-popover p-1 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {menuLabel ? (
          <div className="px-2 pb-1 pt-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            {menuLabel}
          </div>
        ) : null}

        {showSearch ? (
          <div className="sticky top-0 z-10 border-b border-border/80 bg-popover px-1.5 pb-2 pt-1">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={`Search ${menuLabel ?? ariaLabel}`}
                className="h-7 border-border/70 bg-muted/20 pl-7 text-[11px] shadow-none focus-visible:ring-1"
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              />
            </div>
          </div>
        ) : null}

        <div className="max-h-56 overflow-y-auto">
          {visibleOptions.length === 0 ? (
            <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">
              No matches
            </p>
          ) : (
            visibleOptions.map((option, index) => {
            const isSelected = option.value === value;
            const isEmptyOption = !option.value || option.value === emptyValue;
            const showSeparator =
              isEmptyOption && index === 0 && visibleOptions.length > 1;
            const optionStyle = getOptionStyle?.(option, isSelected);

            return (
              <Fragment key={option.value || "__empty"}>
                <DropdownMenuItem
                  onSelect={() => onChange(option.value)}
                  style={optionStyle}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[11px]",
                    "text-popover-foreground focus:bg-accent focus:text-accent-foreground",
                    isSelected && !optionStyle && "bg-accent/80 font-medium",
                    isSelected && optionStyle && "font-medium",
                    isEmptyOption && "text-muted-foreground",
                    getOptionClassName?.(option, isSelected)
                  )}
                >
                  <span className="flex w-3 shrink-0 items-center justify-center">
                    {renderOptionLeading?.(option) ?? null}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-left",
                      isEmptyOption && "italic",
                      getOptionLabelClassName?.(option, isSelected)
                    )}
                  >
                    {option.label}
                  </span>
                  {isSelected ? (
                    <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <span className="h-3 w-3 shrink-0" aria-hidden />
                  )}
                </DropdownMenuItem>
                {showSeparator ? <DropdownMenuSeparator className="my-1 bg-border/80" /> : null}
              </Fragment>
            );
          })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
