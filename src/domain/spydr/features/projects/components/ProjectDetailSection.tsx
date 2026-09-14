import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsPhone } from "@/hooks/useIsPhone";

export const detailFieldClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-[13px] ring-focus transition-colors placeholder:text-muted-foreground";

export const detailTextareaClassName =
  "min-h-[6.5rem] w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-[13px] leading-snug ring-focus transition-colors placeholder:text-muted-foreground";

export const detailInsetPanelClassName =
  "rounded-lg border border-border/70 bg-muted/20 p-3";

interface SectionCollapseContextValue {
  collapsible: boolean;
  expanded: boolean;
  toggle(): void;
}

const SectionCollapseContext = createContext<SectionCollapseContextValue>({
  collapsible: false,
  expanded: true,
  toggle: () => undefined,
});

export function ProjectDetailSection({
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
  variant = "card",
}: {
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  variant?: "card" | "plain";
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <SectionCollapseContext.Provider
      value={{
        collapsible,
        expanded: collapsible ? expanded : true,
        toggle: () => setExpanded((current) => !current),
      }}
    >
      <section
        className={cn(
          "flex min-h-0 flex-col",
          variant === "card" &&
            "overflow-hidden rounded-md border border-border bg-card spydr-plate",
          className,
          collapsible && !expanded && "min-h-0 md:min-h-0"
        )}
      >
        {children}
      </section>
    </SectionCollapseContext.Provider>
  );
}

export function ProjectDetailSectionHeader({
  icon,
  label,
  hint,
  hintClassName,
  actions,
  compact = false,
}: {
  icon?: ReactNode;
  label: string;
  hint?: string;
  hintClassName?: string;
  actions?: ReactNode;
  compact?: boolean;
}) {
  const isPhone = useIsPhone();
  const tight = compact || isPhone;
  const { collapsible, expanded, toggle } = useContext(SectionCollapseContext);

  const content = (
    <>
      {collapsible ? (
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-90"
          )}
          strokeWidth={2.5}
          aria-hidden
        />
      ) : null}
      {icon ? (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-highlight/20 bg-highlight/10 text-highlight [&_svg]:h-3.5 [&_svg]:w-3.5">
          {icon}
        </span>
      ) : null}
      <h2
        className={cn(
          "font-mono uppercase text-foreground",
          tight ? "text-[11px] tracking-[0.12em]" : "text-[10px] tracking-[0.16em]"
        )}
      >
        {label}
      </h2>
      {actions || hint ? (
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
          {actions ? (
            <div
              className="flex shrink-0 items-center gap-2"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {actions}
            </div>
          ) : null}
          {hint ? (
            <span
              className={cn(
                "shrink-0 font-mono tabular-nums text-muted-foreground",
                tight ? "text-[11px]" : "text-[10px]",
                hintClassName
              )}
            >
              {hint}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const shellClass = cn(
    "flex w-full items-center gap-2 bg-muted/20 text-left",
    tight ? "px-3 py-1.5" : "px-3 py-2",
    collapsible && "cursor-pointer transition-colors hover:bg-muted/35",
    expanded && "border-b border-border/70"
  );

  if (collapsible) {
    return (
      <button
        type="button"
        className={shellClass}
        aria-expanded={expanded}
        onClick={toggle}
      >
        {content}
      </button>
    );
  }

  return <div className={shellClass}>{content}</div>;
}

export function ProjectDetailSectionBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { collapsible, expanded } = useContext(SectionCollapseContext);
  if (collapsible && !expanded) return null;

  return (
    <div className={cn("flex flex-1 flex-col gap-4 p-4", className)}>{children}</div>
  );
}

export function ProjectDetailFormPanel({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn(detailInsetPanelClassName, className)}>
      {label ? (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function ProjectDetailEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="spydr-radial px-2 py-6 text-center">
      <p className="text-[13px] text-foreground/75">{title}</p>
      {description ? (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ProjectDetailEntry({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("rounded-sm bg-muted/20 px-2.5 py-2.5", className)}>
      {children}
    </li>
  );
}

export function ProjectDetailInlineError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-destructive/25 bg-destructive/8 px-3 py-2 text-[12px] text-destructive">
      {children}
    </p>
  );
}

export function ProjectDetailField({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block min-w-0 space-y-1.5", className)}>
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {hint ? (
          <span className="text-[10px] normal-case text-muted-foreground/75">
            {hint}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function ProjectDetailTabs<T extends string>({
  value,
  onChange,
  ariaLabel,
  items,
}: {
  value: T;
  onChange(value: T): void;
  ariaLabel: string;
  items: { id: T; label: string; count?: number }[];
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex h-8 min-w-0 flex-1 items-center overflow-hidden rounded-sm border border-border/80 bg-muted/30 p-0.5"
    >
      {items.map((item) => {
        const active = item.id === value;
        const hasItems = (item.count ?? 0) > 0;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "h-full min-w-0 flex-1 truncate rounded-sm px-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(item.id)}
          >
            {item.label}
            {item.count != null ? (
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  active && hasItems
                    ? "text-highlight"
                    : hasItems
                      ? "text-highlight/70"
                      : "text-muted-foreground/70"
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
