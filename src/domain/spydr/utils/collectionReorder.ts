import { arrayMove } from "@dnd-kit/sortable";

export type RankMoveDirection = "up" | "down";

/** Returns a new id order after moving `id` up/down, or null if the move is invalid. */
export function moveIdInOrder(
  orderedIds: readonly string[],
  id: string,
  direction: RankMoveDirection
): string[] | null {
  const index = orderedIds.indexOf(id);
  if (index === -1) return null;
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= orderedIds.length) return null;
  return arrayMove([...orderedIds], index, nextIndex);
}
