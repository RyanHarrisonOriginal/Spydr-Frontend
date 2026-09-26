import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMeasuredVirtualWindow } from "@/domain/spydr/features/shared/hooks/useMeasuredVirtualWindow";
import { VIRTUALIZE_AFTER } from "@/domain/spydr/features/shared/utils/measuredVirtualWindow";

export interface SortableItemRenderProps {
  dragHandleProps: Record<string, unknown> | undefined;
  isDragging: boolean;
  index: number;
}

interface CollectionSortableListProps<T extends { id: string }> {
  items: T[];
  enabled: boolean;
  layout?: "list" | "grid";
  className?: string;
  onReorder(orderedIds: string[]): void;
  renderItem(item: T, props: SortableItemRenderProps): ReactNode;
}

function assignNode(
  ...refs: Array<((node: HTMLElement | null) => void) | undefined>
) {
  return (node: HTMLElement | null) => {
    for (const ref of refs) ref?.(node);
  };
}

function SortableItem<T extends { id: string }>({
  item,
  enabled,
  index,
  className,
  style,
  setMeasuredRef,
  children,
}: {
  item: T;
  enabled: boolean;
  index: number;
  className?: string;
  style?: CSSProperties;
  setMeasuredRef?: (node: HTMLElement | null) => void;
  children: (props: SortableItemRenderProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: item.id,
      disabled: !enabled,
    });

  const sortableStyle: CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={assignNode(setNodeRef, setMeasuredRef)}
      style={sortableStyle}
      className={cn(
        className,
        isDragging && "z-10 opacity-60"
      )}
    >
      {children({
        dragHandleProps: enabled ? { ...attributes, ...listeners } : undefined,
        isDragging,
        index,
      })}
    </li>
  );
}

export function CollectionSortableList<T extends { id: string }>({
  items,
  enabled,
  layout = "list",
  className,
  onReorder,
  renderItem,
}: CollectionSortableListProps<T>) {
  const strategy: SortingStrategy =
    layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy;
  const itemClassName = layout === "grid" ? "h-full min-h-0" : undefined;

  const virtual = layout === "list" && items.length > VIRTUALIZE_AFTER;
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const windowed = useMeasuredVirtualWindow(ids, virtual);
  const visibleItems = virtual ? items.slice(windowed.start, windowed.end) : items;
  const listStyle: CSSProperties | undefined = virtual
    ? { position: "relative", height: windowed.totalSize }
    : undefined;

  const rowStyle = (index: number): CSSProperties | undefined =>
    virtual
      ? {
          position: "absolute",
          top: windowed.offsetOf(index),
          left: 0,
          right: 0,
          margin: 0,
        }
      : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const setListRef = useCallback(
    (node: HTMLUListElement | null) => {
      windowed.rootRef.current = node;
    },
    [windowed.rootRef]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex).map((item) => item.id));
  };

  if (!enabled) {
    return (
      <ul ref={setListRef} className={cn(className, virtual && "w-full")} style={listStyle}>
        {visibleItems.map((item, localIndex) => {
          const index = virtual ? windowed.start + localIndex : localIndex;
          return (
            <li
              key={item.id}
              ref={virtual ? windowed.setRowRef(item.id) : undefined}
              className={itemClassName}
              style={rowStyle(index)}
            >
              {renderItem(item, {
                dragHandleProps: undefined,
                isDragging: false,
                index,
              })}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={visibleItems.map((item) => item.id)} strategy={strategy}>
        <ul ref={setListRef} className={cn(className, virtual && "w-full")} style={listStyle}>
          {visibleItems.map((item, localIndex) => {
            const index = virtual ? windowed.start + localIndex : localIndex;
            return (
              <SortableItem
                key={item.id}
                item={item}
                enabled={enabled}
                index={index}
                className={itemClassName}
                style={rowStyle(index)}
                setMeasuredRef={virtual ? windowed.setRowRef(item.id) : undefined}
              >
                {(props) => renderItem(item, props)}
              </SortableItem>
            );
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
