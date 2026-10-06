import { useAuth } from "@clerk/react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { WebLoaderScreen } from "@/components/WebLoader";

interface RequireAuthProps {
  children: ReactNode;
}

/** Renders children when signed in; sends signed-out users to sign-in with return path. */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <WebLoaderScreen label="Spinning up the web" />;
  }

  if (!isSignedIn) {
    const redirectUrl = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
