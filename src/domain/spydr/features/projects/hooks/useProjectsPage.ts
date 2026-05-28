import { useMemo } from "react";
import { useProjectsQuery } from "@/domain/spydr/features/shared/hooks/queries";

export function useProjectsPage() {
  const query = useProjectsQuery();
  const projects = query.data ?? [];

  const activeCount = useMemo(
    () => projects.filter((project) => project.status === "active").length,
    [projects]
  );

  return {
    projects,
    totalCount: projects.length,
    activeCount,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load projects",
  };
}
