import { Fragment } from "react";
import { Link } from "react-router-dom";
import { breadcrumbPath } from "@/domain/spydr/features/shell/utils/navigationBreadcrumbs";
import { useNavigationBreadcrumbs } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { cn } from "@/lib/utils";

interface BreadcrumbTrailProps {
  className?: string;
}

export function BreadcrumbTrail({ className }: BreadcrumbTrailProps) {
  const { stack } = useNavigationBreadcrumbs();

  if (stack.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex min-w-0 items-center gap-2", className)}
    >
      {stack.map((entry, index) => {
        const isLast = index === stack.length - 1;
        const path = breadcrumbPath(entry);
        const isEntityId =
          /^\/projects\/[^/]+$/.test(entry.pathname) ||
          /^\/tasks\/[^/]+$/.test(entry.pathname) ||
          /^\/notes\/[^/]+$/.test(entry.pathname);
        const labelClassName = cn(
          "truncate",
          isEntityId && "font-mono tabular-nums",
          isLast ? "text-foreground/85" : "transition-colors hover:text-foreground"
        );

        return (
          <Fragment key={`${path}-${index}`}>
            {index > 0 ? (
              <span className="text-muted-foreground/60" aria-hidden>
                /
              </span>
            ) : null}
            {isLast ? (
              <span className={labelClassName}>{entry.label}</span>
            ) : (
              <Link to={path} className={labelClassName}>
                {entry.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
