import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { ApiAuthSync } from "@/components/ApiAuthSync";
import DashboardScreen from "@/screens/DashboardScreen";
import WorkspaceShellScreen from "@/screens/WorkspaceShellScreen";
import ProjectsScreen from "@/screens/ProjectsScreen";
import ProjectDetailScreen from "@/screens/ProjectDetailScreen";
import TasksScreen from "@/screens/TasksScreen";
import TaskDetailScreen from "@/screens/TaskDetailScreen";
import IdeasScreen from "@/screens/IdeasScreen";
import DecisionsScreen from "@/screens/DecisionsScreen";
import NotesScreen from "@/screens/NotesScreen";
import PeopleScreen from "@/screens/PeopleScreen";
import PersonDetailScreen from "@/screens/PersonDetailScreen";
import ResourcesScreen from "@/screens/ResourcesScreen";
import GraphScreen from "@/screens/GraphScreen";
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
                  <WorkspaceShellScreen />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/projects" element={<ProjectsScreen />} />
              <Route path="/projects/:projectId" element={<ProjectDetailScreen />} />
              <Route path="/tasks" element={<TasksScreen />} />
              <Route path="/tasks/:taskId" element={<TaskDetailScreen />} />
              <Route path="/ideas" element={<IdeasScreen />} />
              <Route path="/decisions" element={<DecisionsScreen />} />
              <Route path="/notes" element={<NotesScreen />} />
              <Route path="/people" element={<PeopleScreen />} />
              <Route path="/people/:personId" element={<PersonDetailScreen />} />
              <Route path="/resources" element={<ResourcesScreen />} />
              <Route path="/graph" element={<GraphScreen />} />
            </Route>
            <Route
              path="/ontology/:ontologyId"
              element={
                <Navigate to="/projects" replace />
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
