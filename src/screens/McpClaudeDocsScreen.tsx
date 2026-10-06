import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ClaudeMcpGuide } from "@/domain/spydr/features/mcp/components/ClaudeMcpGuide";

export default function McpClaudeDocsScreen() {
  return (
    <div className="spydr-atmosphere flex h-full flex-col overflow-y-auto text-foreground">
      <header className="spydr-rule spydr-glass sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/10 px-4 md:px-8">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/docs/mcp">MCP overview</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-8">
        <ClaudeMcpGuide variant="page" />
      </main>
    </div>
  );
}
