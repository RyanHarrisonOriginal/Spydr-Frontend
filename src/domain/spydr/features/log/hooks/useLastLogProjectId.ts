import { useEffect } from "react";
import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import type { ProjectNode } from "@/domain/spydr/utils/types";

/** Last project chosen in a log capture picker, per org. */
export function useLastLogProjectId(projects: ProjectNode[]) {
  const { activeOrgId } = useOrganizationContext();
  const [projectId, setProjectId] = usePersistentState<string>(
    activeOrgId ? `log-capture-project:${activeOrgId}` : "log-capture-project:pending",
    () => projects[0]?.id ?? "",
    (raw, fallback) => (typeof raw === "string" ? raw : fallback)
  );

  useEffect(() => {
    if (projects.length === 0) return;
    if (projects.some((project) => project.id === projectId)) return;
    setProjectId(projects[0].id);
  }, [projects, projectId, setProjectId]);

  return [projectId, setProjectId] as const;
}
