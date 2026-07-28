import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const detailFieldClassName =
  "w-full rounded-md border border-input bg-background px-2.5 text-[13px] ring-focus transition-colors placeholder:text-muted-foreground";

export const detailTextareaClassName =
  "min-h-[5.5rem] w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-[12px] leading-snug ring-focus transition-colors placeholder:text-muted-foreground";

export const detailInsetPanelClassName =
  "rounded-lg border border-border/70 bg-muted/20 p-3";

export function ProjectDetailSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-md border border-border bg-card",
        className
      )}
    >
      {children}
    </section>
  );
}

export function ProjectDetailSectionHeader({
  icon,
  label,
  hint,
  hintClassName,
  actions,
}: {
  icon?: ReactNode;
  label: string;
  hint?: string;
  hintClassName?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/25 px-4 py-2.5">
      {icon ? (
        <span className="text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">
          {icon}
        </span>
      ) : null}
      <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/80">
        {label}
      </h2>
      <span className="h-px min-w-4 flex-1 bg-border/80" aria-hidden />
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
      {hint ? (
        <span
          className={cn(
            "font-mono text-[10px] tabular-nums text-muted-foreground",
            hintClassName
          )}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function ProjectDetailSectionBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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
    <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 px-4 py-8 text-center">
      <p className="text-[13px] text-muted-foreground">{title}</p>
      {description ? (
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
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
    <li
      className={cn(
        "rounded-md border border-border/60 bg-background px-3 py-2.5 shadow-sm",
        className
      )}
    >
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
