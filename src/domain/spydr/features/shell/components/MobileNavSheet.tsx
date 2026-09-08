import { SpydrMark } from "@/components/SpydrMark";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { WorkspaceNav } from "./WorkspaceNav";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function MobileNavSheet({ open, onOpenChange }: MobileNavSheetProps) {
  const { activeOrg } = useOrganizationContext();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="spydr-rail bg-sidebar p-0 md:hidden"
        aria-describedby={undefined}
      >
        <SheetHeader className="h-[4.5rem] justify-center border-b border-sidebar-border p-0 px-3 pr-12">
          <SheetTitle className="flex items-center gap-1.5 text-left text-[16px] font-semibold leading-none tracking-[-0.03em]">
            <SpydrMark size={40} className="shrink-0" />
            <span>
              Spydr<span className="text-highlight-secondary">.</span>
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Workspace navigation
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {activeOrg?.name ?? "org"}
          </div>
          <WorkspaceNav onNavigate={() => onOpenChange(false)} />
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--status-done))] opacity-40" />
                <span className="dot relative bg-[hsl(var(--status-done))]" />
              </span>
              <span>All systems nominal</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
