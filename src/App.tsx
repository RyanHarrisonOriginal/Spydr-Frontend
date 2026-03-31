import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { ApiAuthSync } from "@/components/ApiAuthSync";
import OntologyDashboardScreen from "@/screens/OntologyDashboardScreen";
import OntologyCanvasScreen from "@/screens/OntologyCanvasScreen";
import SignInScreen from "@/screens/SignInScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import NotFoundScreen from "@/screens/NotFoundScreen";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ApiAuthSync />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <Routes>
            <Route path="/sign-in" element={<SignInScreen />} />
            <Route path="/sign-up" element={<SignUpScreen />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <OntologyDashboardScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/ontology/:ontologyId"
              element={
                <RequireAuth>
                  <OntologyCanvasScreen />
                </RequireAuth>
              }
            />
            <Route path="/404" element={<NotFoundScreen />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
