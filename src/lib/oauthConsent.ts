const OAUTH_KEYS = [
  "client_id",
  "redirect_uri",
  "response_type",
  "scope",
  "state",
  "nonce",
  "code_challenge",
  "code_challenge_method",
  "resource",
] as const;

export function oauthAuthorizeParams(
  search: string,
  hash = ""
): URLSearchParams {
  const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?")) : "";
  const merged = new URLSearchParams(
    hashQuery.startsWith("?") ? hashQuery : hash.replace(/^#\/?/, "")
  );
  new URLSearchParams(search).forEach((value, key) => {
    merged.set(key, value);
  });
  return merged;
}

export function isOAuthAuthorizeRequest(search: string, hash = ""): boolean {
  const params = oauthAuthorizeParams(search, hash);
  return Boolean(params.get("client_id") && params.get("redirect_uri"));
}

export function oauthConsentPath(search: string, hash = ""): string {
  const params = oauthAuthorizeParams(search, hash);
  const next = new URLSearchParams();
  for (const key of OAUTH_KEYS) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `/oauth-consent?${query}` : "/oauth-consent";
}
