import { useAuth, RedirectToSignIn } from "@clerk/react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { WebLoaderScreen } from "@/components/WebLoader";

interface RequireAuthProps {
  children: ReactNode;
}

/** Renders children when signed in; redirects to sign-in when signed out. */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <WebLoaderScreen label="Spinning up the web" />;
  }

  if (!isSignedIn) {
    const redirectUrl = `${location.pathname}${location.search}`;
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center text-muted-foreground text-sm">
          Redirecting to sign in…
        </div>
        <RedirectToSignIn signInFallbackRedirectUrl={redirectUrl} />
      </div>
    );
  }

  return <>{children}</>;
}
