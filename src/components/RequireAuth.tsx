import { useAuth, RedirectToSignIn } from "@clerk/react";
import type { ReactNode } from "react";

interface RequireAuthProps {
  children: ReactNode;
}

/** Renders children when signed in; redirects to sign-in when signed out. */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm">
          Redirecting to sign in…
        </div>
        <RedirectToSignIn />
      </div>
    );
  }

  return <>{children}</>;
}
