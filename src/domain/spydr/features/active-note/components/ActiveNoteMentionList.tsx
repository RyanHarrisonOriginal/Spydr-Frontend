import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type MouseEvent,
} from "react";
import { FileText, FolderKanban, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mentionKindLabel,
  type ActiveNoteMentionItem,
  type ActiveNoteMentionKind,
} from "../utils/activeNoteMentions";

export type ActiveNoteMentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

export interface ActiveNoteMentionListProps {
  items: ActiveNoteMentionItem[];
  command: (attrs: {
    id: string;
    label: string;
    kind: ActiveNoteMentionKind;
  }) => void;
  isLoading?: boolean;
}

function KindIcon({ kind }: { kind: ActiveNoteMentionKind }) {
  const className = "h-3.5 w-3.5 shrink-0 text-muted-foreground";
  switch (kind) {
    case "project":
      return <FolderKanban className={className} />;
    case "task":
      return <ListTodo className={className} />;
    case "note":
      return <FileText className={className} />;
  }
}

export const ActiveNoteMentionList = forwardRef<
  ActiveNoteMentionListRef,
  ActiveNoteMentionListProps
>(function ActiveNoteMentionList({ items, command, isLoading }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (!item) return;
    command({
      id: item.id,
      label: item.title.trim() || "Untitled",
      kind: item.kind,
    });
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
      className="z-30 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-md border border-border bg-background shadow-lg"
      role="listbox"
      aria-label="Reference projects, tasks, or notes"
    >
      <div className="border-b border-border/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Reference · @project @task @note
      </div>
      {isLoading && items.length === 0 ? (
        <p className="px-2.5 py-3 text-[12px] text-muted-foreground">
          Loading references…
        </p>
      ) : items.length === 0 ? (
        <p className="px-2.5 py-3 text-[12px] text-muted-foreground">
          No matches. Try @project, @task, or @note.
        </p>
      ) : (
        <ul className="max-h-56 overflow-y-auto py-1">
          {items.map((item, index) => {
            const active = index === selectedIndex;
            return (
              <li key={`${item.kind}-${item.id}`}>
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
                  <KindIcon kind={item.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-snug">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {mentionKindLabel(item.kind)}
                      {item.subtitle ? ` · ${item.subtitle}` : ""}
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
