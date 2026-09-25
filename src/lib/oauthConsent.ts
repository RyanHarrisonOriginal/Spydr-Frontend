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

const RESUME_KEYS = [
  "redirect_url",
  "sign_in_force_redirect_url",
  "sign_in_fallback_redirect_url",
  "after_sign_in_url",
  "after_sign_up_url",
] as const;

export type OAuthNavigationTarget =
  | { type: "consent"; to: string }
  | { type: "external"; href: string };

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

function isTrustedClerkOAuthUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  const clerkHost =
    host === "clerk.spydr-app.cloud" ||
    host === "accounts.spydr-app.cloud" ||
    host.endsWith(".clerk.accounts.dev") ||
    host.endsWith(".accounts.dev");
  if (!clerkHost) return false;
  return (
    path.includes("/oauth/authorize") ||
    path.includes("/oauth/consent") ||
    path.includes("/oauth-consent") ||
    path.includes("/v1/oauth")
  );
}

function classifyResumeUrl(
  raw: string,
  origin: string
): OAuthNavigationTarget | null {
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return null;
  }

  if (isTrustedClerkOAuthUrl(url)) {
    return { type: "external", href: url.href };
  }
  if (isOAuthAuthorizeRequest(url.search, url.hash)) {
    return { type: "consent", to: oauthConsentPath(url.search, url.hash) };
  }
  if (url.pathname === "/oauth-consent" || url.pathname.endsWith("/oauth-consent")) {
    return { type: "consent", to: `${url.pathname}${url.search}` };
  }
  return null;
}

export function oauthNavigationTarget(
  search: string,
  hash = "",
  origin = "https://spydr-app.cloud"
): OAuthNavigationTarget | null {
  if (isOAuthAuthorizeRequest(search, hash)) {
    return { type: "consent", to: oauthConsentPath(search, hash) };
  }
  const params = oauthAuthorizeParams(search, hash);
  for (const key of RESUME_KEYS) {
    const raw = params.get(key);
    if (!raw) continue;
    const target = classifyResumeUrl(raw, origin);
    if (target) return target;
  }
  return null;
}
