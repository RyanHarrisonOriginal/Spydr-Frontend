import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  workspaceNavSections,
  type WorkspaceNavItem,
} from "../utils/workspaceNav";

function Item({
  to,
  icon: Icon,
  label,
  badge,
  disabled,
  collapsed = false,
  onNavigate,
}: WorkspaceNavItem & { collapsed?: boolean; onNavigate?: () => void }) {
  const content = (isActive = false) => (
    <>
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100",
          isActive && "text-highlight opacity-100"
        )}
      />
      <span className={cn("flex-1 truncate", collapsed && "sr-only")}>{label}</span>
      {badge && !collapsed && (
        <span className="rounded border border-border bg-muted/40 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {badge}
        </span>
      )}
    </>
  );

  if (disabled || !to) {
    return (
      <div
        title={collapsed ? label : undefined}
        className={cn(
          "group flex min-h-11 cursor-not-allowed items-center gap-2 rounded-sm px-2 text-[14px] text-sidebar-foreground/35 md:h-7 md:min-h-0 md:text-[13px]",
          collapsed && "justify-center px-1.5"
        )}
      >
        {content()}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "group flex min-h-11 items-center gap-2 rounded-sm px-2 text-[14px] text-sidebar-foreground/80 transition-colors ring-focus hover:bg-muted/40 hover:text-foreground md:h-7 md:min-h-0 md:text-[13px]",
          collapsed && "justify-center px-1.5",
          isActive && "nav-active text-foreground"
        )
      }
    >
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
}

function Section({
  label,
  collapsed = false,
  children,
}: {
  label: string;
  collapsed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("px-2 py-1.5", collapsed && "px-1")}>
      <div className={cn("mb-1 flex items-center justify-between px-2", collapsed && "sr-only")}>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

export function WorkspaceNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto" aria-label="Workspace">
      {workspaceNavSections.map((section) => (
        <Section key={section.label} label={section.label} collapsed={collapsed}>
          {section.items.map((item) => (
            <Item key={item.label} {...item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </Section>
      ))}
    </nav>
  );
}
