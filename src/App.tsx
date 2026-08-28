import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { ApiAuthSync } from "@/components/ApiAuthSync";
import { OrganizationProvider } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { CurrentUserPersonProvider } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import DashboardScreen from "@/screens/DashboardScreen";
import WorkspaceShellScreen from "@/screens/WorkspaceShellScreen";
import WorkScreen from "@/screens/WorkScreen";
import ProjectDetailScreen from "@/screens/ProjectDetailScreen";
import TaskDetailScreen from "@/screens/TaskDetailScreen";
import IdeasScreen from "@/screens/IdeasScreen";
import DecisionsScreen from "@/screens/DecisionsScreen";
import NotesScreen from "@/screens/NotesScreen";
import NoteDetailScreen from "@/screens/NoteDetailScreen";
import ActiveNoteScreen from "@/screens/ActiveNoteScreen";
import PersonDetailScreen from "@/screens/PersonDetailScreen";
import ResourcesScreen from "@/screens/ResourcesScreen";
import SignInScreen from "@/screens/SignInScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import NotFoundScreen from "@/screens/NotFoundScreen";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <ApiAuthSync />
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <div className="h-full">
            <Routes>
            <Route path="/sign-in" element={<SignInScreen />} />
            <Route path="/sign-up" element={<SignUpScreen />} />
            <Route
              element={
                <RequireAuth>
                  <OrganizationProvider>
                    <CurrentUserPersonProvider>
                      <WorkspaceShellScreen />
                    </CurrentUserPersonProvider>
                  </OrganizationProvider>
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/active-note" replace />} />
              <Route path="/active-note" element={<ActiveNoteScreen />} />
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/work" element={<WorkScreen />} />
              <Route path="/projects" element={<Navigate to="/work" replace />} />
              <Route path="/projects/:projectId" element={<ProjectDetailScreen />} />
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
              <Route path="/people/:personId" element={<PersonDetailScreen />} />
              <Route path="/resources" element={<ResourcesScreen />} />
            </Route>
            <Route
              path="/ontology/:ontologyId"
              element={
                <Navigate to="/work" replace />
              }
            />
            <Route path="/404" element={<NotFoundScreen />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
