import { MoreHorizontal } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { mobilePrimaryTabs } from "../utils/workspaceNav";

interface MobileTabBarProps {
  navOpen: boolean;
  onOpenNav(): void;
}

export function MobileTabBar({ navOpen, onOpenNav }: MobileTabBarProps) {
  const { pathname } = useLocation();
  const primaryActive = mobilePrimaryTabs.some((tab) => tab.isActive(pathname));

  return (
    <nav
      aria-label="Primary"
      className="z-30 grid shrink-0 grid-cols-4 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      {mobilePrimaryTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.id}
            to={tab.to}
            className={() =>
              cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground ring-focus",
                tab.isActive(pathname) && "text-highlight"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        );
      })}
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="More"
        aria-expanded={navOpen}
        className={cn(
          "flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground ring-focus",
          !primaryActive && "text-highlight"
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
        More
      </button>
    </nav>
  );
}
