import type { ComponentType, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  Archive,
  Bookmark,
  CheckSquare,
  FileText,
  FolderKanban,
  GitBranch,
  Inbox,
  Lightbulb,
  Network,
  LayoutDashboard,
  Sun,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  to?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  disabled?: boolean;
}

const outlooks: NavigationItem[] = [
  { icon: Sun, label: "Today", badge: "later", disabled: true },
];

const operate: NavigationItem[] = [
  { icon: Inbox, label: "Inbox", badge: "later", disabled: true },
];

const workspace: NavigationItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/ideas", icon: Lightbulb, label: "Ideas" },
  { to: "/decisions", icon: GitBranch, label: "Decisions" },
  { to: "/notes", icon: FileText, label: "Notes" },
  { to: "/people", icon: Users, label: "People" },
  { to: "/resources", icon: Bookmark, label: "Resources" },
];

const meta: NavigationItem[] = [
  { icon: Network, label: "Graph", badge: "later", disabled: true },
  { icon: Archive, label: "Archived", badge: "later", disabled: true },
];

function Item({ to, icon: Icon, label, badge, disabled }: NavigationItem) {
  const content = (isActive = false) => (
    <>
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100",
          isActive && "text-highlight-secondary opacity-100"
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="rounded border border-border bg-muted/40 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {badge}
        </span>
      )}
    </>
  );

  if (disabled || !to) {
    return (
      <div className="group flex h-7 cursor-not-allowed items-center gap-2 rounded-md px-2 text-[13px] text-sidebar-foreground/35">
        {content()}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "group flex h-7 items-center gap-2 rounded-md px-2 text-[13px] text-sidebar-foreground/80 row-hover ring-focus",
          isActive &&
            "bg-highlight-secondary/10 text-foreground shadow-[inset_2px_0_0_0_hsl(var(--highlight-secondary))]"
        )
      }
    >
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="px-2 py-1.5">
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-12 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="grid h-5 w-5 place-items-center rounded-[5px] bg-primary text-primary-foreground">
          <span className="font-mono text-[11px] font-bold leading-none">S</span>
        </div>
        <span className="text-[13px] font-semibold tracking-tight">Spydr</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          prod
        </span>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto">
        <Section label="Outlooks">
          {outlooks.map((item) => (
            <Item key={item.label} {...item} />
          ))}
        </Section>
        <Section label="Operate">
          {operate.map((item) => (
            <Item key={item.label} {...item} />
          ))}
        </Section>
        <Section label="Workspace">
          {workspace.map((item) => (
            <Item key={item.label} {...item} />
          ))}
        </Section>
        <Section label="Meta">
          {meta.map((item) => (
            <Item key={item.label} {...item} />
          ))}
        </Section>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="dot bg-[hsl(var(--status-done))]" />
          <span>Authenticated workspace</span>
        </div>
      </div>
    </aside>
  );
}
