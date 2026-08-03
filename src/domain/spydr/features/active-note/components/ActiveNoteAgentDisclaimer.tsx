import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveNoteAgentDisclaimerProps {
  className?: string;
}

export function ActiveNoteAgentDisclaimer({
  className,
}: ActiveNoteAgentDisclaimerProps) {
  return (
    <div
      role="note"
      aria-label="Active Note agent disclaimer"
      className={cn(
        "flex items-start gap-2.5 border-b border-border/80 bg-muted/25 px-4 py-2.5 text-[12.5px] leading-relaxed text-muted-foreground md:px-6",
        className
      )}
    >
      <Info
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-highlight"
        aria-hidden
      />
      <p>
        We&apos;re still working on the Active Note agent and its capabilities.
        Suggestions may be incomplete or off — thanks for your patience, and
        please share feedback when something doesn&apos;t look right.
      </p>
    </div>
  );
}
