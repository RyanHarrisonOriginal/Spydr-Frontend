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
  disabled,
  collapsed = false,
  onNavigate,
}: WorkspaceNavItem & { collapsed?: boolean; onNavigate?: () => void }) {
  const icon = <Icon aria-hidden />;

  if (disabled || !to) {
    return (
      <div
        role="link"
        aria-disabled="true"
        tabIndex={-1}
        title="Coming later"
        className={cn(
          "shell-sidebar-item",
          collapsed && "justify-center px-0"
        )}
      >
        {icon}
        <span className={cn("flex-1 truncate", collapsed && "sr-only")}>
          {label}
        </span>
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
          "shell-sidebar-item ring-focus",
          collapsed && "justify-center px-0",
          isActive && "is-active"
        )
      }
    >
      {icon}
      <span className={cn("flex-1 truncate", collapsed && "sr-only")}>
        {label}
      </span>
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
    <div className="shell-sidebar-section">
      <div
        className={cn("shell-sidebar-section-label", collapsed && "sr-only")}
      >
        {label}
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
            <Item
              key={item.label}
              {...item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </Section>
      ))}
    </nav>
  );
}
