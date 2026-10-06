import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { MCP_CAPABILITIES } from "@/content/mcp-clients";

export default function McpDocsScreen() {
  const capabilityList = `${MCP_CAPABILITIES.slice(0, -1).join(", ")}, and ${
    MCP_CAPABILITIES[MCP_CAPABILITIES.length - 1]
  }`;

  return (
    <div className="spydr-atmosphere flex h-full flex-col overflow-y-auto text-foreground">
      <header className="spydr-rule spydr-glass sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/10 px-4 md:px-8">
        <Logo size="sm" />
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">Back</Link>
        </Button>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-8">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-highlight">
          MCP
        </p>
        <h1 className="mb-4 text-[32px] font-semibold tracking-[-0.02em]">
          Spydr MCP
        </h1>
        <p className="mb-4 text-[16px] leading-relaxed text-foreground/75">
          Spydr exposes an MCP server so compatible AI assistants can read and
          update your workspace—{capabilityList}.
        </p>
        <p className="mb-8 text-[16px] leading-relaxed text-foreground/75">
          Start with the Claude guide for web, Desktop, and Claude Code.
        </p>

        <Link
          to="/docs/mcp/claude"
          className="spydr-plate inline-flex flex-col gap-1 rounded-md border border-white/15 border-l-2 border-l-highlight px-4 py-3 transition-colors hover:border-highlight/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Connect Claude
          </span>
          <span className="text-[13px] text-muted-foreground">
            Step-by-step for Claude on the web, Claude Desktop, and Claude Code
          </span>
        </Link>
      </main>
    </div>
  );
}
