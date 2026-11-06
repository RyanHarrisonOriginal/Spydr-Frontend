import { SpydrMark } from "@/components/SpydrMark";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import "../shell-chrome.css";
import { WorkspaceNav } from "./WorkspaceNav";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function MobileNavSheet({ open, onOpenChange }: MobileNavSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="shell-sidebar border-r border-[var(--line)] p-3 md:hidden"
        style={{ background: "var(--canvas)", width: 232 }}
        aria-describedby={undefined}
      >
        <SheetHeader className="shell-sidebar-brand space-y-0 p-0 text-left">
          <SheetTitle className="flex items-center gap-2 p-0">
            <SpydrMark size={22} className="shrink-0" />
            <span className="shell-sidebar-brand-name">Spydr</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Workspace navigation
          </SheetDescription>
        </SheetHeader>

        <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
          <WorkspaceNav onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
