import { describe, expect, it } from "vitest";
import {
  isOAuthAuthorizeRequest,
  oauthConsentPath,
  oauthNavigationTarget,
} from "./oauthConsent";

describe("oauthConsent", () => {
  const search =
    "?client_id=https://claude.ai/oauth/mcp-oauth-client-metadata&redirect_uri=https://claude.ai/api/mcp/auth_callback&scope=openid+profile+email&state=abc";

  it("detects authorize params in the query string", () => {
    expect(isOAuthAuthorizeRequest(search)).toBe(true);
    expect(isOAuthAuthorizeRequest("")).toBe(false);
  });

  it("detects authorize params in a Clerk hash", () => {
    expect(isOAuthAuthorizeRequest("", `#/${search}`)).toBe(true);
  });

  it("rebuilds the consent path without dropping OAuth params", () => {
    expect(oauthConsentPath(search)).toBe(
      "/oauth-consent?client_id=https%3A%2F%2Fclaude.ai%2Foauth%2Fmcp-oauth-client-metadata&redirect_uri=https%3A%2F%2Fclaude.ai%2Fapi%2Fmcp%2Fauth_callback&scope=openid+profile+email&state=abc"
    );
  });

  it("sends a bare app URL with authorize params to consent", () => {
    expect(oauthNavigationTarget(search)?.to).toBe(oauthConsentPath(search));
  });

  it("resumes Clerk authorize when only redirect_url is present", () => {
    const authorize =
      "https://clerk.spydr-app.cloud/oauth/authorize?client_id=https://claude.ai/oauth/mcp-oauth-client-metadata&redirect_uri=https://claude.ai/api/mcp/auth_callback";
    expect(
      oauthNavigationTarget(`?redirect_url=${encodeURIComponent(authorize)}`)
    ).toEqual({ type: "external", href: authorize });
  });

  it("does not treat the product home page as an OAuth resume", () => {
    expect(
      oauthNavigationTarget(
        `?redirect_url=${encodeURIComponent("https://spydr-app.cloud/today")}`
      )
    ).toBeNull();
  });
});
