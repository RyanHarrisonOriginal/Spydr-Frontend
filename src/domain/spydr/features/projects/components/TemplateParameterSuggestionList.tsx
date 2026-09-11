import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type MouseEvent,
} from "react";
import { Braces } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateParameterOption } from "../utils/templateParameters";

export type TemplateParameterSuggestionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

export interface TemplateParameterSuggestionListProps {
  items: TemplateParameterOption[];
  command: (attrs: { id: string; label: string }) => void;
  emptyMessage?: string;
}

export const TemplateParameterSuggestionList = forwardRef<
  TemplateParameterSuggestionListRef,
  TemplateParameterSuggestionListProps
>(function TemplateParameterSuggestionList(
  { items, command, emptyMessage = "Add a parameter first, then type {{" },
  ref
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (!item) return;
    command({ id: item.key, label: item.key });
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((index) =>
          items.length === 0 ? 0 : (index + items.length - 1) % items.length
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((index) =>
          items.length === 0 ? 0 : (index + 1) % items.length
        );
        return true;
      }

      if (event.key === "Enter" || event.key === "Tab") {
        if (items.length === 0) return false;
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div
      className="z-50 w-[min(100vw-2rem,18rem)] overflow-hidden rounded-md border border-border bg-background shadow-lg"
      role="listbox"
      aria-label="Insert template parameter"
    >
      <div className="border-b border-border/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Parameters · {"{{KEY}}"}
      </div>
      {items.length === 0 ? (
        <p className="px-2.5 py-3 text-[12px] text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="max-h-56 overflow-y-auto py-1">
          {items.map((item, index) => {
            const active = index === selectedIndex;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "flex w-full items-start gap-2 px-2.5 py-2 text-left transition-colors",
                    active
                      ? "bg-highlight/[0.08] text-foreground"
                      : "hover:bg-muted/50"
                  )}
                  onMouseDown={(event: MouseEvent) => {
                    event.preventDefault();
                    selectItem(index);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Braces className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[12px] font-medium leading-snug">
                      {`{{${item.key}}}`}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {item.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
