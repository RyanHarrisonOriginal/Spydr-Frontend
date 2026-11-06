import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TruncatedText } from "@/domain/spydr/features/shared/components/TruncatedText";
import { cn } from "@/lib/utils";
import type { LogConfig, MetaPart } from "../types";
import { formatEditedAgo, formatLogClock } from "../utils/formatLogClock";

interface LogItemProps<T extends { id: string }> {
  item: T;
  config: LogConfig<T>;
  ranked: boolean;
  dragHandleProps?: Record<string, unknown>;
}

function MetaLine({ parts }: { parts: MetaPart[] }) {
  if (parts.length === 0) return null;

  const nodes: ReactNode[] = [];
  parts.forEach((part, index) => {
    if (index > 0) {
      nodes.push(
        <span key={`sep-${index}`} className="log-item-meta-sep" aria-hidden>
          ·
        </span>
      );
    }
    if (part.kind === "project") {
      nodes.push(
        <Link key={`p-${part.id}`} to={`/projects/${part.id}`}>
          <FolderKanban className="h-3 w-3 shrink-0" aria-hidden />
          <TruncatedText text={part.title} className="min-w-0" />
        </Link>
      );
      return;
    }
    if (part.kind === "status") {
      nodes.push(
        <span key={`s-${part.status}`}>
          <span
            className="log-status-dot"
            style={{ background: part.color }}
            aria-hidden
          />
          {part.label}
        </span>
      );
      return;
    }
    if (part.kind === "edited") {
      nodes.push(
        <span key={`e-${index}`} className="log-item-meta-edited">
          edited {part.label}
        </span>
      );
      return;
    }
    nodes.push(<span key={`t-${index}`}>{part.text}</span>);
  });

  return <div className="log-item-meta">{nodes}</div>;
}

export function LogItem<T extends { id: string }>({
  item,
  config,
  ranked,
  dragHandleProps,
}: LogItemProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const primary = config.primary(item);
  const title = config.title?.(item) ?? null;
  const secondary = config.secondary?.(item) ?? null;
  const stamp = config.getTimestamp(item);
  const edited = formatEditedAgo(
    config.getCreatedAt(item),
    config.getUpdatedAt(item)
  );
  const meta = [
    ...config.meta(item),
    ...(edited ? [{ kind: "edited" as const, label: edited }] : []),
  ];

  const PrimaryIcon = config.primaryAction.icon;
  const primaryIsEdit =
    config.primaryAction.label.toLowerCase() === "edit";
  const showSeparateEdit = !primaryIsEdit;

  const needsClamp = primary.length > 280;
  const clamped = needsClamp && !expanded;

  return (
    <article className="log-item">
      {ranked ? (
        <button
          type="button"
          className="log-item-handle"
          aria-label="Drag to reorder"
          {...dragHandleProps}
        >
          <span className="log-drag-dots" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} />
            ))}
          </span>
        </button>
      ) : (
        <time className="log-item-time" dateTime={stamp}>
          {formatLogClock(stamp)}
        </time>
      )}

      <div className="min-w-0">
        {title ? <div className="log-item-title">{title}</div> : null}
        {primary ? (
          <p
            className={cn("log-item-primary", title && "mt-0.5")}
            data-clamped={clamped ? "true" : "false"}
          >
            {primary}
          </p>
        ) : null}
        {needsClamp ? (
          <button
            type="button"
            className="log-item-more"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        ) : null}
        {secondary ? (
          <p
            className="log-item-secondary"
            style={
              config.secondaryLines
                ? { WebkitLineClamp: config.secondaryLines }
                : undefined
            }
          >
            {secondary}
          </p>
        ) : null}
        <MetaLine parts={meta} />
      </div>

      <div className="log-item-actions">
        <button
          type="button"
          className="log-action-btn"
          aria-label={config.primaryAction.label}
          title={config.primaryAction.label}
          onClick={() => config.primaryAction.onRun(item)}
        >
          <PrimaryIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
        {showSeparateEdit ? (
          <button
            type="button"
            className="log-action-btn"
            aria-label="Edit"
            title="Edit"
            onClick={() => config.onEdit(item)}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="log-action-btn"
              aria-label="More actions"
              title="More"
            >
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={Boolean(
                config.deletingId && config.deletingId !== item.id
              )}
              onClick={() => config.onDelete(item)}
            >
              {config.deletingId === item.id ? "Deleting…" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
