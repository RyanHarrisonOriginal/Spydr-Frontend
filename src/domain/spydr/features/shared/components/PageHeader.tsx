import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BreadcrumbTrail } from "@/domain/spydr/features/shared/components/BreadcrumbTrail";
import heroSpiderWeb from "@/assets/hero-spider-web.png";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  showBreadcrumbs?: boolean;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function PageHeader({
  eyebrow,
  showBreadcrumbs = true,
  title,
  meta,
  actions,
  className,
  titleClassName,
}: PageHeaderProps) {
  const breadcrumb = showBreadcrumbs && !eyebrow ? <BreadcrumbTrail /> : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-y-0 right-0 h-full w-[min(100%,62.4rem)]"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 28%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 28%)",
          }}
        >
          <img
            src={heroSpiderWeb}
            alt=""
            className="h-full w-full object-cover object-right"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
      </div>
      <div className="relative flex min-h-[7.5rem] items-end justify-between gap-6 px-6 py-6">
        <div className="min-w-0 flex-1">
          {(eyebrow ?? breadcrumb) ? (
            <div
              className={cn(
                "font-mono text-[10px] tracking-[0.14em] text-muted-foreground",
                eyebrow ? "uppercase tracking-[0.18em]" : "normal-case"
              )}
            >
              {eyebrow ?? breadcrumb}
            </div>
          ) : null}
          <h1
            className={cn(
              "mt-1 truncate text-[20px] font-semibold leading-tight tracking-tight",
              titleClassName
            )}
          >
            {title}
          </h1>
          {meta && (
            <div className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
              {meta}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
