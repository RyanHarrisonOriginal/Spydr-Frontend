import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "@/lib/apiClient";

/**
 * Sets the API module's auth token getter from Clerk so all backend requests
 * include the Bearer token. Must be mounted inside ClerkProvider.
 */
export function ApiAuthSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}
