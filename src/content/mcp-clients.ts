import { MCP_SERVER_URL } from "@/config/mcp";

/**
 * Capabilities exposed by Spydr's MCP server today
 * (`apps/api/src/infra/mcp/create-mcp-server.ts`).
 * No decision tools are registered.
 */
export const MCP_CAPABILITIES = [
  "projects",
  "tasks",
  "notes",
  "ideas",
  "people",
  "templates",
] as const;

export type McpClientId = "claudeWeb" | "claudeDesktop" | "claudeCode";

export interface McpGuideStep {
  title: string;
  body: string;
}

export interface McpClientGuide {
  id: McpClientId;
  label: string;
  /** ISO date YYYY-MM-DD — update when you re-verify against Claude's UI. */
  lastVerified: string;
  summary: string;
  steps: McpGuideStep[];
  /** Optional shell/config snippet; URL is always interpolated from MCP_SERVER_URL. */
  command?: string;
  tips?: string[];
}

const webDesktopSteps: McpGuideStep[] = [
  {
    title: "Open Connectors",
    body: "In Claude (claude.ai) or Claude Desktop, go to Customize → Connectors.",
  },
  {
    title: "Add a custom connector",
    body: 'Click Add (or “+”), choose Custom → Web / “Add custom connector.”',
  },
  {
    title: "Name it and paste the Spydr URL",
    body: `Name the connector “Spydr” and paste the server URL: ${MCP_SERVER_URL}. Click Continue.`,
  },
  {
    title: "Keep OAuth sign-in",
    body: "Leave authentication on sign-in (Sign in now or Sign in when needed). Prefer “Use Claude’s published identity” for the OAuth client. Do not switch to “No sign in.”",
  },
  {
    title: "Add and connect",
    body: "Click Add, then Connect on the Spydr connector. Sign in with your Spydr account when prompted and approve access.",
  },
  {
    title: "Enable in a chat",
    body: "In a conversation, open “+” → Connectors and turn Spydr on so Claude can use its tools.",
  },
];

/**
 * Client-specific connection steps. Edit this file when Claude's UI changes.
 * Keys: claudeWeb, claudeDesktop, claudeCode.
 */
export const mcpClients: Record<McpClientId, McpClientGuide> = {
  claudeWeb: {
    id: "claudeWeb",
    label: "Claude (web)",
    lastVerified: "2026-10-05",
    summary:
      "Add Spydr as a custom remote MCP connector in Claude on the web.",
    steps: webDesktopSteps,
    tips: [
      "Spydr must be reachable on the public internet—Claude connects from Anthropic’s cloud, not your browser alone.",
      "Free plans are limited to one custom connector.",
      "Team/Enterprise: an Owner may need to add the connector in Organization settings → Connectors before members can Connect.",
    ],
  },
  claudeDesktop: {
    id: "claudeDesktop",
    label: "Claude Desktop",
    lastVerified: "2026-10-05",
    summary:
      "Same custom connector flow as Claude on the web—Customize → Connectors.",
    steps: webDesktopSteps,
    tips: [
      "Use the latest Claude Desktop build. Remote connectors still talk to Spydr from Anthropic’s cloud.",
      "After connecting, enable Spydr under “+” → Connectors in a chat.",
    ],
  },
  claudeCode: {
    id: "claudeCode",
    label: "Claude Code",
    lastVerified: "2026-10-05",
    summary:
      "Register Spydr as a remote HTTP MCP server from the Claude Code CLI.",
    steps: [
      {
        title: "Add the Spydr HTTP server",
        body: "In a terminal, run the command below. Claude Code will store the remote HTTP endpoint.",
      },
      {
        title: "Authenticate",
        body: "If prompted, complete OAuth (Claude Code opens a browser). Sign in with your Spydr account and approve access. You can also manage auth from the /mcp panel.",
      },
      {
        title: "Confirm tools",
        body: "Run /mcp or ask Claude Code to list Spydr tools. You should see project, task, note, idea, people, and template tools.",
      },
    ],
    command: `claude mcp add --transport http spydr ${MCP_SERVER_URL}`,
    tips: [
      "Use type “http” (or “streamable-http” in JSON). A URL without a type is treated as stdio and will fail.",
      "Remove with: claude mcp remove spydr",
    ],
  },
};

export const MCP_INTRO = {
  lead: "Connecting Claude to Spydr lets your assistant work inside your workspace over MCP—not just summarize what you paste.",
  capabilities: `Once connected, Claude can read and update your ${MCP_CAPABILITIES.slice(0, -1).join(", ")}, and ${MCP_CAPABILITIES[MCP_CAPABILITIES.length - 1]} through Spydr’s tools.`,
} as const;

export function formatVerifiedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
