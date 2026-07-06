import { Outlet } from "react-router-dom";
import { OrganizationOnboarding } from "@/domain/spydr/features/organizations/components/OrganizationOnboarding";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function WorkspaceShell() {
  const { isLoading, isReady, organizations } = useOrganizationContext();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (!isReady && organizations.length === 0) {
    return <OrganizationOnboarding />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="spydr-surface min-h-0 min-w-0 flex-1 overflow-y-auto animate-in-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
