import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { ClaudeMcpGuide } from "@/domain/spydr/features/mcp/components/ClaudeMcpGuide";

/** Signed-in Settings → Integrations → Connect Claude */
export function ConnectClaudePanel() {
  return (
    <section className="border-b border-border/60 px-4 py-6 md:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-highlight" aria-hidden strokeWidth={1.75} />
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Integrations · Connect Claude
          </h2>
        </div>
        <Link
          to="/docs/mcp/claude"
          className="text-[12px] text-highlight underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Open full guide
        </Link>
      </div>
      <ClaudeMcpGuide variant="panel" />
    </section>
  );
}
