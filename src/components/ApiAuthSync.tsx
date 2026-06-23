import { useLayoutEffect, useRef } from "react";
import { useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "@/lib/apiClient";

/**
 * Sets the API module's auth token getter from Clerk so all backend requests
 * include the Bearer token. Must be mounted inside ClerkProvider.
 */
export function ApiAuthSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const authRef = useRef({ getToken, isLoaded, isSignedIn });
  authRef.current = { getToken, isLoaded, isSignedIn };

  useLayoutEffect(() => {
    setAuthTokenGetter(async () => {
      const { getToken, isLoaded, isSignedIn } = authRef.current;
      if (!isLoaded || !isSignedIn) return null;
      return getToken();
    });
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}
