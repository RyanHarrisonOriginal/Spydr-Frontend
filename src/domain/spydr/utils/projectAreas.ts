import type { ProjectAreaNode, ProjectNode } from "@/domain/spydr/utils/types";

export function resolveProjectAreaId(
  project: Pick<ProjectNode, "area">,
  areas: ProjectAreaNode[]
): string {
  if (!project.area) return "";
  const match = areas.find(
    (area) => area.title.toLowerCase() === project.area?.toLowerCase()
  );
  return match?.id ?? "";
}
