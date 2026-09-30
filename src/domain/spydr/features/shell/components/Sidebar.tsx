import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SpydrMark } from "@/components/SpydrMark";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";
import { cn } from "@/lib/utils";
import { WorkspaceNav } from "./WorkspaceNav";

export function Sidebar() {
  const { activeOrg } = useOrganizationContext();
  const [collapsed, setCollapsed] = usePersistentState(
    "sidebar-collapsed",
    () => false,
    (raw, fallback) => (typeof raw === "boolean" ? raw : fallback)
  );

  return (
    <aside
      id="workspace-sidebar"
      className={cn(
        "spydr-rail hidden h-full shrink-0 flex-col overflow-x-hidden border-r border-white/10 transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <div
        className={cn(
          "flex h-[4.5rem] items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-1" : "gap-1.5 px-3"
        )}
      >
        <SpydrMark size={collapsed ? 36 : 52} className="shrink-0" />
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1 text-[16px] font-semibold leading-none tracking-[-0.03em]">
              Spydr<span className="text-highlight-secondary">.</span>
            </span>
            <span className="max-w-[4.5rem] truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/80">
              {activeOrg?.name ?? "org"}
            </span>
          </>
        )}
      </div>

      <div className={cn("flex px-2 pt-2", collapsed && "justify-center px-1")}>
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
          aria-controls="workspace-sidebar"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-8 items-center gap-2 rounded-sm text-muted-foreground ring-focus transition-colors hover:bg-muted/40 hover:text-foreground",
            collapsed ? "w-8 justify-center" : "w-full px-2"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {collapsed ? null : <span className="text-[12px]">Collapse</span>}
        </button>
      </div>

      <div className="mt-1 flex min-h-0 flex-1 flex-col">
        <WorkspaceNav collapsed={collapsed} />
      </div>

      <div className="px-3">
        <div className="web-divider" />
      </div>
      <div className={cn("border-t border-sidebar-border p-3", collapsed && "px-1")}>
        <div
          className={cn(
            "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--status-done))] opacity-40" />
            <span className="dot relative bg-[hsl(var(--status-done))]" />
          </span>
          {collapsed ? (
            <span className="sr-only">All systems nominal</span>
          ) : (
            <span>All systems nominal</span>
          )}
        </div>
      </div>
    </aside>
  );
}
