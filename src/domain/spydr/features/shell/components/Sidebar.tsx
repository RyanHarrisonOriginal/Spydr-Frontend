import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SpydrMark } from "@/components/SpydrMark";
import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";
import { useNarrowDesktop } from "@/hooks/useIsPhone";
import { cn } from "@/lib/utils";
import "../shell-chrome.css";
import { WorkspaceNav } from "./WorkspaceNav";

export type ShellHealthStatus = {
  tone: "warn" | "danger";
  message: string;
} | null;

export function Sidebar({ health = null }: { health?: ShellHealthStatus }) {
  const narrowDesktop = useNarrowDesktop();
  const [userCollapsed, setUserCollapsed] = usePersistentState(
    "sidebar-collapsed",
    () => false,
    (raw, fallback) => (typeof raw === "boolean" ? raw : fallback)
  );
  const [sessionExpanded, setSessionExpanded] = useState(false);

  useEffect(() => {
    setSessionExpanded(false);
  }, [narrowDesktop]);

  const collapsed = narrowDesktop ? !sessionExpanded : userCollapsed;

  const toggleCollapsed = () => {
    if (narrowDesktop) {
      setSessionExpanded((current) => !current);
      return;
    }
    setUserCollapsed((current) => !current);
  };

  return (
    <aside
      id="workspace-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "shell-sidebar hidden h-full shrink-0 flex-col overflow-x-hidden transition-[width] duration-200 ease-out md:flex"
      )}
    >
      <div
        className={cn(
          "shell-sidebar-brand",
          collapsed && "justify-center"
        )}
      >
        {collapsed ? null : (
          <>
            <SpydrMark size={22} className="shrink-0" />
            <span className="shell-sidebar-brand-name">Spydr</span>
          </>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="workspace-sidebar"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("shell-sidebar-collapse ring-focus", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <WorkspaceNav collapsed={collapsed} />
      </div>

      {health ? (
        <div className="shell-sidebar-footer" role="status">
          <span
            className="shell-sidebar-footer-dot"
            data-tone={health.tone}
            aria-hidden
          />
          {collapsed ? (
            <span className="sr-only">{health.message}</span>
          ) : (
            <span>{health.message}</span>
          )}
        </div>
      ) : null}
    </aside>
  );
}
