import type { ProjectAreaNode, ProjectNode } from "@/domain/spydr/utils/types";

export function resolveProjectAreaId(
  project: Pick<ProjectNode, "area">,
  areas: ProjectAreaNode[]
): string {
  return findAreaIdByTitle(project.area, areas);
}

export function findAreaIdByTitle(
  title: string | null | undefined,
  areas: ProjectAreaNode[]
): string {
  if (!title) return "";
  const match = areas.find(
    (area) => area.title.toLowerCase() === title.toLowerCase()
  );
  return match?.id ?? "";
}
