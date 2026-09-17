import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { WebLoaderScreen } from "@/components/WebLoader";
import { OrganizationOnboarding } from "@/domain/spydr/features/organizations/components/OrganizationOnboarding";
import { PendingInvitesList } from "@/domain/spydr/features/organizations/components/PendingInvitesList";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { NavigationBreadcrumbProvider } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { useIsPhone } from "@/hooks/useIsPhone";
import { MobileNavSheet } from "./MobileNavSheet";
import { MobileTabBar } from "./MobileTabBar";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function WorkspaceShell() {
  const { isLoading, isReady, organizations } = useOrganizationContext();
  const isPhone = useIsPhone();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!isPhone) setNavOpen(false);
  }, [isPhone]);

  if (isLoading) {
    return <WebLoaderScreen label="Loading workspace" />;
  }

  if (!isReady && organizations.length === 0) {
    return <OrganizationOnboarding />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <PendingInvitesList className="border-b border-border px-4 py-2" />
          <main className="spydr-surface flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden animate-in-fade">
            <NavigationBreadcrumbProvider>
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                <Outlet />
              </div>
            </NavigationBreadcrumbProvider>
          </main>
        </div>
      </div>
      <MobileTabBar navOpen={navOpen} onOpenNav={() => setNavOpen(true)} />
      <MobileNavSheet open={navOpen} onOpenChange={setNavOpen} />
    </div>
  );
}
