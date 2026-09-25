import { OAuthConsent } from "@clerk/react";
import { clerkAppearance } from "@/lib/clerkAppearance";

/**
 * Clerk OAuth consent for MCP clients (Claude, ChatGPT).
 * Must stay on this URL so client_id and redirect_uri in the query string
 * are not dropped by the workspace shell.
 */
export default function OAuthConsentScreen() {
  return (
    <div className="flex h-full items-center justify-center bg-background p-5">
      <OAuthConsent appearance={clerkAppearance} />
    </div>
  );
}
