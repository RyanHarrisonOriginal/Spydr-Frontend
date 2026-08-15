import { useCallback, useMemo, useState } from "react";

export function useItemSelection(itemIds: readonly string[]) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const selectedIds = useMemo(
    () => itemIds.filter((id) => selected.has(id)),
    [itemIds, selected]
  );

  const selectedCount = selectedIds.length;
  const allSelected = itemIds.length > 0 && selectedCount === itemIds.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const isSelected = useCallback(
    (id: string) => selected.has(id),
    [selected]
  );

  const toggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setAll = useCallback(
    (checked: boolean) => {
      setSelected(checked ? new Set(itemIds) : new Set());
    },
    [itemIds]
  );

  const clear = useCallback(() => setSelected(new Set()), []);

  return {
    selectedIds,
    selectedCount,
    allSelected,
    someSelected,
    isSelected,
    toggle,
    setAll,
    clear,
  };
}
