/**
 * Public Spydr MCP HTTP endpoint.
 * Override with VITE_MCP_SERVER_URL in env (no trailing slash required).
 */
export const MCP_SERVER_URL =
  (
    (import.meta as { env?: { VITE_MCP_SERVER_URL?: string } }).env
      ?.VITE_MCP_SERVER_URL ?? "https://api.spydr-app.cloud/mcp"
  ).replace(/\/$/, "") || "https://api.spydr-app.cloud/mcp";
