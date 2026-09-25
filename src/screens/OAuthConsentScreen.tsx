import { OAuthConsent, useAuth } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { WebLoaderScreen } from "@/components/WebLoader";
import { clerkAppearance } from "@/lib/clerkAppearance";

/**
 * Clerk OAuth consent for MCP clients (Claude, ChatGPT).
 * Stay on this origin for sign-in so client_id and redirect_uri are not
 * dropped by the Account Portal after-sign-in URL.
 */
export default function OAuthConsentScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <WebLoaderScreen label="Spinning up the web" />;
  }

  if (!isSignedIn) {
    const returnUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`}
        replace
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-background p-5">
      <OAuthConsent appearance={clerkAppearance} />
    </div>
  );
}
