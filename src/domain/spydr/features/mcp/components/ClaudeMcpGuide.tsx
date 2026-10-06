import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MCP_SERVER_URL } from "@/config/mcp";
import {
  formatVerifiedDate,
  mcpClients,
  MCP_INTRO,
  type McpClientGuide,
  type McpClientId,
} from "@/content/mcp-clients";

type GuideTab = "webDesktop" | "claudeCode";

function CopyField({
  value,
  label,
  mono = true,
}: {
  value: string;
  label: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="spydr-plate flex items-stretch gap-2 rounded-md border border-white/10 p-2 pl-3">
      <div className="min-w-0 flex-1 py-1.5">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "break-all text-[13px] text-foreground",
            mono && "font-mono text-[12px]"
          )}
        >
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-auto shrink-0 self-center px-3"
        onClick={() => void copy()}
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[hsl(var(--status-done))]" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        <span>{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  );
}

function ClientSteps({ guide }: { guide: McpClientGuide }) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        {guide.summary}
      </p>

      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Last verified: {formatVerifiedDate(guide.lastVerified)}
      </p>

      {guide.command ? <CopyField value={guide.command} label="Command" /> : null}

      <ol className="space-y-4">
        {guide.steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-white/10 font-mono text-[11px] text-highlight">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {guide.tips && guide.tips.length > 0 ? (
        <ul className="space-y-2 border-t border-white/10 pt-4">
          {guide.tips.map((tip) => (
            <li
              key={tip}
              className="text-[13px] leading-relaxed text-muted-foreground"
            >
              {tip}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function WebDesktopPanel() {
  const web = mcpClients.claudeWeb;
  const desktop = mcpClients.claudeDesktop;

  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        Claude on the web and Claude Desktop use the same custom connector flow.
        Steps below match Customize → Connectors.
      </p>

      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Last verified: web {formatVerifiedDate(web.lastVerified)} · desktop{" "}
        {formatVerifiedDate(desktop.lastVerified)}
      </p>

      <ol className="space-y-4">
        {web.steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-white/10 font-mono text-[11px] text-highlight">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <ul className="space-y-2 border-t border-white/10 pt-4">
        {[...(web.tips ?? []), ...(desktop.tips ?? [])]
          .filter((tip, index, all) => all.indexOf(tip) === index)
          .map((tip) => (
            <li
              key={tip}
              className="text-[13px] leading-relaxed text-muted-foreground"
            >
              {tip}
            </li>
          ))}
      </ul>
    </div>
  );
}

export interface ClaudeMcpGuideProps {
  /** Compact chrome for the signed-in settings panel. */
  variant?: "page" | "panel";
  className?: string;
  defaultTab?: GuideTab;
}

export function ClaudeMcpGuide({
  variant = "page",
  className,
  defaultTab = "webDesktop",
}: ClaudeMcpGuideProps) {
  const [tab, setTab] = useState<GuideTab>(defaultTab);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        {variant === "page" ? (
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground md:text-[32px]">
            Connect Claude
          </h1>
        ) : (
          <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
            Connect Claude
          </h2>
        )}
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {MCP_INTRO.lead}
        </p>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {MCP_INTRO.capabilities}
        </p>
      </div>

      <CopyField value={MCP_SERVER_URL} label="Server URL" />

      <div>
        <div
          role="tablist"
          aria-label="Claude client"
          className="mb-4 flex flex-wrap gap-1 rounded-md border border-white/10 bg-card/20 p-1"
        >
          {(
            [
              { id: "webDesktop", label: "Claude (web & desktop)" },
              { id: "claudeCode", label: "Claude Code" },
            ] as const
          ).map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn(
                  "rounded-sm px-3 py-2 text-[13px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          className="spydr-plate rounded-md border border-white/10 p-4 md:p-5"
        >
          {tab === "webDesktop" ? (
            <WebDesktopPanel />
          ) : (
            <ClientSteps guide={mcpClients.claudeCode} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Exported for tests / deep-links that need a specific client id. */
export function mcpClientById(id: McpClientId): McpClientGuide {
  return mcpClients[id];
}
