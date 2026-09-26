import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface TruncatedTextProps {
  text: string;
  lines?: number;
  variant?: "end" | "middle";
  className?: string;
}

function middleEllipsis(text: string, fits: (value: string) => boolean) {
  if (fits(text)) return text;
  let low = 0;
  let high = Math.max(0, text.length - 1);
  let best = "…";
  while (low <= high) {
    const keep = Math.floor((low + high) / 2);
    const head = Math.ceil(keep / 2);
    const tail = Math.floor(keep / 2);
    const candidate =
      tail > 0 ? `${text.slice(0, head)}…${text.slice(text.length - tail)}` : `${text.slice(0, head)}…`;
    if (fits(candidate)) {
      best = candidate;
      low = keep + 1;
    } else {
      high = keep - 1;
    }
  }
  return best;
}

function lineHeightOf(element: HTMLElement) {
  const computed = getComputedStyle(element);
  const fontSize = parseFloat(computed.fontSize) || 16;
  const parsed = parseFloat(computed.lineHeight);
  return Number.isFinite(parsed) ? parsed : fontSize * 1.2;
}

/**
 * Shows an ellipsis only after measuring real overflow, and exposes the full
 * string through a popover, keyboard focus, and an accessible name.
 */
export function TruncatedText({
  text,
  lines = 1,
  variant = "end",
  className,
}: TruncatedTextProps) {
  const dialogId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [truncated, setTruncated] = useState(false);
  const [fitted, setFitted] = useState(text);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const lineCount = Math.max(1, lines);
  const singleLine = variant === "middle" || lineCount <= 1;

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const measureEl = measureRef.current;
    if (!slot || !measureEl) return;

    const measure = () => {
      measureEl.textContent = text;
      measureEl.style.whiteSpace = singleLine ? "nowrap" : "normal";
      const width = measureEl.clientWidth;
      if (width <= 0) return;

      const overflows = singleLine
        ? measureEl.scrollWidth > width + 1
        : measureEl.scrollHeight > lineHeightOf(measureEl) * lineCount + 1;

      const nextFitted =
        variant === "middle" && overflows
          ? middleEllipsis(text, (value) => {
              measureEl.textContent = value;
              return measureEl.scrollWidth <= width + 1;
            })
          : text;
      measureEl.textContent = text;

      setTruncated((current) => (current === overflows ? current : overflows));
      setFitted((current) => (current === nextFitted ? current : nextFitted));
      if (!overflows) setOpen(false);
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(slot);
    return () => observer.disconnect();
  }, [lineCount, singleLine, text, variant]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - 16 - 240);
    setPosition({
      top: rect.bottom + 4,
      left: Math.min(Math.max(8, rect.left), maxLeft),
    });
  }, [open, fitted, truncated]);

  const shown = variant === "middle" && truncated ? fitted : text;
  const truncationStyle: CSSProperties = !truncated
    ? { minWidth: 0 }
    : singleLine
      ? {
          overflow: "hidden",
          textOverflow: variant === "middle" ? "clip" : "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          maxWidth: "100%",
        }
      : {
          display: "-webkit-box",
          WebkitLineClamp: lineCount,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minWidth: 0,
          maxWidth: "100%",
        };

  const closeIfFocusLeaves = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && popoverRef.current?.contains(next)) return;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") setOpen(false);
  };

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        return;
      }
    } catch {
      // Fall through to the selection copy path.
    }

    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const copiedWithCommand = document.execCommand("copy");
      area.remove();
      setCopied(copiedWithCommand);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span
      ref={rootRef}
      className={cn("relative flex w-full min-w-0 max-w-full items-center gap-1", className)}
    >
      <span ref={slotRef} className="relative block min-w-0 flex-1">
        <span
          ref={measureRef}
          data-truncate-measure="true"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 block w-full opacity-0"
        />
        {truncated ? (
          <button
            ref={triggerRef}
            type="button"
            className="block w-full min-w-0 bg-transparent p-0 text-left text-inherit"
            style={truncationStyle}
            aria-label={text}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? dialogId : undefined}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onBlur={closeIfFocusLeaves}
            onKeyDown={onKeyDown}
          >
            {shown}
          </button>
        ) : (
          <span className="block min-w-0" style={truncationStyle}>
            {text}
          </span>
        )}
      </span>
      {variant === "middle" ? (
        <button
          type="button"
          className="shrink-0 rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-foreground hover:bg-muted"
          onClick={() => void copy()}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      ) : null}
      {open && truncated
        ? createPortal(
            <div
              ref={popoverRef}
              id={dialogId}
              role="dialog"
              aria-label={text}
              className="z-[120] max-h-[50vh] max-w-[min(24rem,calc(100vw-1rem))] overflow-y-auto whitespace-pre-wrap break-all border border-border/90 bg-popover p-2 text-[13px] text-popover-foreground shadow-lg"
              style={{ position: "fixed", top: position.top, left: position.left }}
              onKeyDown={onKeyDown}
            >
              {text}
            </div>,
            document.body
          )
        : null}
    </span>
  );
}
