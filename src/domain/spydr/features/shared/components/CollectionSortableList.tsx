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
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SortableItemRenderProps {
  dragHandleProps: Record<string, unknown> | undefined;
  isDragging: boolean;
}

interface CollectionSortableListProps<T extends { id: string }> {
  items: T[];
  enabled: boolean;
  layout?: "list" | "grid";
  className?: string;
  onReorder(orderedIds: string[]): void;
  renderItem(item: T, props: SortableItemRenderProps): ReactNode;
}

function SortableItem<T extends { id: string }>({
  item,
  enabled,
  className,
  style,
  children,
}: {
  item: T;
  enabled: boolean;
  className?: string;
  style?: CSSProperties;
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
      ref={setNodeRef}
      style={sortableStyle}
      className={cn(className, isDragging && "relative z-10 opacity-60")}
    >
      {children({
        dragHandleProps: enabled ? { ...attributes, ...listeners } : undefined,
        isDragging,
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
      <ul className={className}>
        {items.map((item) => (
          <li key={item.id}>
            {renderItem(item, { dragHandleProps: undefined, isDragging: false })}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={strategy}>
        <ul className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} enabled={enabled}>
              {(props) => renderItem(item, props)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
