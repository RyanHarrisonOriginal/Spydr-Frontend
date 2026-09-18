import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ColumnResizeHandleProps {
  label: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange(width: number): void;
  onReset?(): void;
}

export function ColumnResizeHandle({
  label,
  width,
  minWidth,
  maxWidth,
  onWidthChange,
  onReset,
}: ColumnResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ startX: 0, startWidth: 0 });

  useEffect(() => {
    if (!dragging) return;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [dragging]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize. Double-click to reset."
      className="group absolute -right-2 top-0 z-10 flex h-full w-4 cursor-col-resize touch-none items-center justify-center"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const cell = event.currentTarget.parentElement;
        const measured = Math.round(
          cell?.getBoundingClientRect().width ?? width
        );
        drag.current = { startX: event.clientX, startWidth: measured };
        if (measured !== width) onWidthChange(measured);
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        onWidthChange(
          drag.current.startWidth + (event.clientX - drag.current.startX)
        );
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setDragging(false);
      }}
      onPointerCancel={() => setDragging(false)}
      onLostPointerCapture={() => setDragging(false)}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onReset?.();
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onWidthChange(width - 16);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          onWidthChange(width + 16);
        } else if (event.key === "Home") {
          event.preventDefault();
          onReset?.();
        }
      }}
    >
      <span
        className={cn(
          "pointer-events-none h-[calc(100%-6px)] w-px rounded-full transition-colors",
          dragging
            ? "bg-highlight"
            : "bg-transparent group-hover:bg-highlight/70 group-focus-visible:bg-highlight"
        )}
      />
    </div>
  );
}

interface ResizableHeaderCellProps {
  label: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange(width: number): void;
  onReset?(): void;
  className?: string;
  children: ReactNode;
}

export function ResizableHeaderCell({
  label,
  width,
  minWidth,
  maxWidth,
  onWidthChange,
  onReset,
  className,
  children,
}: ResizableHeaderCellProps) {
  return (
    <div className={cn("relative flex min-w-0 items-center pr-1", className)}>
      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
      <ColumnResizeHandle
        label={label}
        width={width}
        minWidth={minWidth}
        maxWidth={maxWidth}
        onWidthChange={onWidthChange}
        onReset={onReset}
      />
    </div>
  );
}
