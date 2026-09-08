import type { ComponentType } from "react";
import {
  Archive,
  Bookmark,
  FileText,
  FolderKanban,
  GitBranch,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  PenLine,
  Sun,
} from "lucide-react";

export interface WorkspaceNavItem {
  to?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export const homeNavItems: WorkspaceNavItem[] = [
  { to: "/active-note", icon: PenLine, label: "Active Note" },
];

export const outlookNavItems: WorkspaceNavItem[] = [
  { icon: Sun, label: "Today", badge: "later", disabled: true },
  { icon: Inbox, label: "Inbox", badge: "later", disabled: true },
];

export const workspaceNavItems: WorkspaceNavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/work", icon: FolderKanban, label: "Work" },
  { to: "/ideas", icon: Lightbulb, label: "Ideas" },
  { to: "/decisions", icon: GitBranch, label: "Decisions" },
  { to: "/notes", icon: FileText, label: "Notes" },
  { to: "/resources", icon: Bookmark, label: "Resources" },
];

export const metaNavItems: WorkspaceNavItem[] = [
  { icon: Archive, label: "Archived", badge: "later", disabled: true },
];

export const workspaceNavSections: { label: string; items: WorkspaceNavItem[] }[] =
  [
    { label: "Home", items: homeNavItems },
    { label: "Outlooks", items: outlookNavItems },
    { label: "Workspace", items: workspaceNavItems },
    { label: "Meta", items: metaNavItems },
  ];

export interface MobileTab {
  id: string;
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  isActive(pathname: string): boolean;
}

export const mobilePrimaryTabs: MobileTab[] = [
  {
    id: "active-note",
    to: "/active-note",
    label: "Note",
    icon: PenLine,
    isActive: (pathname) => pathname.startsWith("/active-note"),
  },
  {
    id: "work",
    to: "/work",
    label: "Work",
    icon: FolderKanban,
    isActive: (pathname) =>
      pathname.startsWith("/work") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/tasks") ||
      pathname.startsWith("/people"),
  },
  {
    id: "notes",
    to: "/notes",
    label: "Notes",
    icon: FileText,
    isActive: (pathname) => pathname.startsWith("/notes"),
  },
];
