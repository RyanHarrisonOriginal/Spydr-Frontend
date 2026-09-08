import { SpydrMark } from "@/components/SpydrMark";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { WorkspaceNav } from "./WorkspaceNav";

export function Sidebar() {
  const { activeOrg } = useOrganizationContext();

  return (
    <aside className="spydr-rail hidden h-full w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-[4.5rem] items-center gap-1.5 border-b border-sidebar-border px-3">
        <SpydrMark size={52} className="shrink-0" />
        <span className="min-w-0 flex-1 text-[16px] font-semibold leading-none tracking-[-0.03em]">
          Spydr<span className="text-highlight-secondary">.</span>
        </span>
        <span className="max-w-[4.5rem] truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/80">
          {activeOrg?.name ?? "org"}
        </span>
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <WorkspaceNav />
      </div>

      <div className="px-3">
        <div className="web-divider" />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--status-done))] opacity-40" />
            <span className="dot relative bg-[hsl(var(--status-done))]" />
          </span>
          <span>All systems nominal</span>
        </div>
      </div>
    </aside>
  );
}
