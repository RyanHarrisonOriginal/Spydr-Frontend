import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { ui } from "@clerk/ui";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import App from "./App";
import { clerkAppearance } from "@/lib/clerkAppearance";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <ClerkProvider
        publishableKey={
          (import.meta as { env?: { VITE_CLERK_PUBLISHABLE_KEY?: string } }).env
            ?.VITE_CLERK_PUBLISHABLE_KEY ?? ""
        }
        ui={ui}
        appearance={clerkAppearance}
        afterSignOutUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
        <App />
      </ClerkProvider>
    </AppErrorBoundary>
  </StrictMode>
);
