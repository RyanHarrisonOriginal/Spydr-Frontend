import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { oauthNavigationTarget } from "@/lib/oauthConsent";
import { WebLoaderScreen } from "@/components/WebLoader";
import { workPersonPath } from "@/domain/spydr/features/work/utils/workPaths";
import { PhoneLayoutSync } from "@/components/PhoneLayoutSync";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { ApiAuthSync } from "@/components/ApiAuthSync";
import { OrganizationProvider } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { CurrentUserPersonProvider } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import DashboardScreen from "@/screens/DashboardScreen";
import WorkspaceShellScreen from "@/screens/WorkspaceShellScreen";
import WorkScreen from "@/screens/WorkScreen";
import TodayScreen from "@/screens/TodayScreen";
import ProjectDetailScreen from "@/screens/ProjectDetailScreen";
import ProjectTemplateCreateScreen from "@/screens/ProjectTemplateCreateScreen";
import ProjectTemplateEditScreen from "@/screens/ProjectTemplateEditScreen";
import ProjectTemplatesScreen from "@/screens/ProjectTemplatesScreen";
import TaskDetailScreen from "@/screens/TaskDetailScreen";
import IdeasScreen from "@/screens/IdeasScreen";
import DecisionsScreen from "@/screens/DecisionsScreen";
import NotesScreen from "@/screens/NotesScreen";
import NoteDetailScreen from "@/screens/NoteDetailScreen";
import ResourcesScreen from "@/screens/ResourcesScreen";
import SignInScreen from "@/screens/SignInScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import OAuthConsentScreen from "@/screens/OAuthConsentScreen";
import AcceptInviteScreen from "@/screens/AcceptInviteScreen";
import OrganizationSettingsScreen from "@/screens/OrganizationSettingsScreen";
import NotFoundScreen from "@/screens/NotFoundScreen";

const queryClient = new QueryClient();

function RedirectPersonToWork() {
  const { personId } = useParams<{ personId: string }>();
  return <Navigate to={personId ? workPersonPath(personId) : "/work"} replace />;
}

function ResumeClerkOAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const skip =
    location.pathname === "/oauth-consent" ||
    location.pathname === "/sign-in" ||
    location.pathname === "/sign-up";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const target = skip
    ? null
    : oauthNavigationTarget(location.search, location.hash, origin);

  if (target?.type === "consent") {
    return <Navigate to={target.to} replace />;
  }
  if (target?.type === "external") {
    window.location.replace(target.href);
    return <WebLoaderScreen label="Continuing sign in" />;
  }
  return <>{children}</>;
}

function WorkspaceHomeRedirect() {
  const location = useLocation();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const target = oauthNavigationTarget(location.search, location.hash, origin);
  if (target?.type === "consent") {
    return <Navigate to={target.to} replace />;
  }
  if (target?.type === "external") {
    window.location.replace(target.href);
    return <WebLoaderScreen label="Continuing sign in" />;
  }
  return <Navigate to="/today" replace />;
}

function AuthenticatedLayout() {
  return (
    <RequireAuth>
      <OrganizationProvider>
        <CurrentUserPersonProvider>
          <Outlet />
        </CurrentUserPersonProvider>
      </OrganizationProvider>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <PhoneLayoutSync />
      <QueryClientProvider client={queryClient}>
        <ApiAuthSync />
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <div className="h-full">
            <ResumeClerkOAuth>
            <Routes>
            <Route path="/sign-in" element={<SignInScreen />} />
            <Route path="/sign-up" element={<SignUpScreen />} />
            <Route path="/oauth-consent" element={<OAuthConsentScreen />} />
            <Route element={<AuthenticatedLayout />}>
              <Route path="/invites/:token" element={<AcceptInviteScreen />} />
              <Route element={<WorkspaceShellScreen />}>
                <Route index element={<WorkspaceHomeRedirect />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/today" element={<TodayScreen />} />
                <Route path="/work" element={<WorkScreen />} />
                <Route path="/projects" element={<Navigate to="/work" replace />} />
                <Route path="/projects/:projectId" element={<ProjectDetailScreen />} />
                <Route
                  path="/project-templates"
                  element={<ProjectTemplatesScreen />}
                />
                <Route
                  path="/project-templates/new"
                  element={<ProjectTemplateCreateScreen />}
                />
                <Route
                  path="/project-templates/:templateId/edit"
                  element={<ProjectTemplateEditScreen />}
                />
                <Route
                  path="/tasks"
                  element={<Navigate to="/work?view=tasks" replace />}
                />
                <Route path="/tasks/:taskId" element={<TaskDetailScreen />} />
                <Route path="/ideas" element={<IdeasScreen />} />
                <Route path="/decisions" element={<DecisionsScreen />} />
                <Route path="/notes" element={<NotesScreen />} />
                <Route path="/notes/:noteId" element={<NoteDetailScreen />} />
                <Route path="/people" element={<Navigate to="/work" replace />} />
                <Route path="/people/:personId" element={<RedirectPersonToWork />} />
                <Route path="/resources" element={<ResourcesScreen />} />
                <Route path="/settings" element={<OrganizationSettingsScreen />} />
              </Route>
            </Route>
            <Route path="/404" element={<NotFoundScreen />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            </ResumeClerkOAuth>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
