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
  Settings,
  Sun,
} from "lucide-react";

export interface WorkspaceNavItem {
  to?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export const outlookNavItems: WorkspaceNavItem[] = [
  { to: "/today", icon: Sun, label: "Today" },
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
  { to: "/settings", icon: Settings, label: "Settings" },
  { icon: Archive, label: "Archived", badge: "later", disabled: true },
];

export const workspaceNavSections: { label: string; items: WorkspaceNavItem[] }[] =
  [
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
    id: "today",
    to: "/today",
    label: "Today",
    icon: Sun,
    isActive: (pathname) => pathname.startsWith("/today"),
  },
  {
    id: "work",
    to: "/work",
    label: "Work",
    icon: FolderKanban,
    isActive: (pathname) =>
      pathname.startsWith("/work") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/project-templates") ||
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
