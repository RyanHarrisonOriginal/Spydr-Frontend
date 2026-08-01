import type { ReactNode } from "react";
import { SpydrMark } from "@/components/SpydrMark";

interface ListStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function LoadingState({ title = "Loading" }: Partial<ListStateProps>) {
  return (
    <div className="grid min-h-[240px] place-items-center px-6 py-12 text-center">
      <div>
        <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border border-border border-t-primary" />
        <p className="text-[13px] text-muted-foreground">{title}…</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, children }: ListStateProps) {
  return (
    <div className="grid min-h-[240px] place-items-center px-6 py-12 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-5 grid place-items-center">
          <SpydrMark size={72} className="shrink-0" />
        </div>
        <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}

export function ErrorState({ title, description, children }: ListStateProps) {
  return (
    <div className="grid min-h-[240px] place-items-center px-6 py-12 text-center">
      <div className="max-w-sm rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
        <h2 className="text-[14px] font-semibold text-destructive">{title}</h2>
        {description && (
          <p className="mt-2 text-[12.5px] text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
