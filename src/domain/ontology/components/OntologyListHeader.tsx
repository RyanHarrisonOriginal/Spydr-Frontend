import type { ReactNode } from "react";

interface OntologyListHeaderProps {
  left?: ReactNode;
  right?: ReactNode;
}

export function OntologyListHeader({ left, right }: OntologyListHeaderProps) {
  return (
    <header className="h-16 border-b border-border/40 flex items-center justify-between px-8 md:px-16 bg-card/60 backdrop-blur-xl fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center min-w-0">{left}</div>
      <div className="flex items-center gap-2 shrink-0">{right}</div>
    </header>
  );
}
