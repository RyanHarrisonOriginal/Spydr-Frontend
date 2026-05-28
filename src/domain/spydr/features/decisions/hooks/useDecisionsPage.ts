import { useMemo } from "react";
import { useDecisionsQuery } from "@/domain/spydr/features/shared/hooks/queries";

export function useDecisionsPage() {
  const query = useDecisionsQuery();
  const decisions = query.data ?? [];

  const sortedDecisions = useMemo(
    () =>
      [...decisions].sort((a, b) => {
        const aDate = new Date(a.details?.decidedAt ?? a.updatedAt).getTime();
        const bDate = new Date(b.details?.decidedAt ?? b.updatedAt).getTime();
        return bDate - aDate;
      }),
    [decisions]
  );

  return {
    decisions: sortedDecisions,
    totalCount: decisions.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load decisions",
  };
}
