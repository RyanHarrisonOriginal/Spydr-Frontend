import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BreadcrumbTrail } from "@/domain/spydr/features/shared/components/BreadcrumbTrail";
import { WebField } from "@/components/WebField";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  showBreadcrumbs?: boolean;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
  /** Tighter chrome for operator detail pages. */
  dense?: boolean;
}

export function PageHeader({
  eyebrow,
  showBreadcrumbs = true,
  title,
  meta,
  actions,
  className,
  titleClassName,
  dense = false,
}: PageHeaderProps) {
  const breadcrumb = showBreadcrumbs && !eyebrow ? <BreadcrumbTrail /> : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border spydr-rule",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 opacity-90",
          dense ? "w-[min(100%,28rem)]" : "w-[min(100%,36rem)]"
        )}
        aria-hidden
      >
        <WebField className="h-full w-full" intensity="ambient" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
      </div>

      <div
        className={cn(
          "relative flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-end",
          dense
            ? "min-h-0 px-4 py-3 md:px-6"
            : "min-h-0 gap-4 px-4 py-5 md:min-h-[6.5rem] md:gap-8 md:px-8 md:py-7"
        )}
      >
        <div className="min-w-0 flex-1">
          {(eyebrow ?? breadcrumb) ? (
            <div
              className={cn(
                "font-mono text-[10px] tracking-[0.16em] text-muted-foreground",
                eyebrow ? "uppercase tracking-[0.2em]" : "normal-case"
              )}
            >
              {eyebrow ?? breadcrumb}
            </div>
          ) : null}
          <h1
            className={cn(
              "font-semibold leading-none tracking-[-0.03em]",
              dense ? "mt-1 text-[18px]" : "mt-2 text-[20px] md:text-[22px]",
              "truncate",
              titleClassName
            )}
          >
            {title}
          </h1>
          {meta && (
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 text-muted-foreground",
                dense ? "mt-1.5 text-[11px]" : "mt-2.5 text-[12px]"
              )}
            >
              {meta}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 pb-0.5">{actions}</div>
        )}
      </div>
    </div>
  );
}
