import { describe, expect, it } from "vitest";
import {
  isOAuthAuthorizeRequest,
  oauthConsentPath,
} from "./oauthConsent";

describe("oauthConsent", () => {
  const search =
    "?client_id=https://claude.ai/oauth/mcp-oauth-client-metadata&redirect_uri=https://claude.ai/api/mcp/auth_callback&scope=openid+profile+email&state=abc";

  it("detects authorize params in the query string", () => {
    expect(isOAuthAuthorizeRequest(search)).toBe(true);
    expect(isOAuthAuthorizeRequest("")).toBe(false);
  });

  it("detects authorize params in a Clerk hash", () => {
    expect(
      isOAuthAuthorizeRequest("", `#/${search}`)
    ).toBe(true);
  });

  it("rebuilds the consent path without dropping OAuth params", () => {
    expect(oauthConsentPath(search)).toBe(
      "/oauth-consent?client_id=https%3A%2F%2Fclaude.ai%2Foauth%2Fmcp-oauth-client-metadata&redirect_uri=https%3A%2F%2Fclaude.ai%2Fapi%2Fmcp%2Fauth_callback&scope=openid+profile+email&state=abc"
    );
  });
});
