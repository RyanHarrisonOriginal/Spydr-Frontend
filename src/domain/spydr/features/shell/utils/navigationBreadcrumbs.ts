export interface NavigationBreadcrumb {
  pathname: string;
  search: string;
  label: string;
}

export const WORKSPACE_ROOT_PATHS = new Set([
  "/dashboard",
  "/projects",
  "/tasks",
  "/ideas",
  "/decisions",
  "/notes",
  "/people",
  "/resources",
  "/graph",
]);

const ROOT_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/ideas": "Ideas",
  "/decisions": "Decisions",
  "/notes": "Notes",
  "/people": "People",
  "/resources": "Resources",
  "/graph": "Lineage",
};

export function formatBreadcrumbEntityId(id: string, length = 8): string {
  return id.slice(0, length);
}

function extractEntityId(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null;
  const id = pathname.slice(prefix.length);
  if (!id || id.includes("/")) return null;
  return id;
}

export function getDefaultBreadcrumbLabel(pathname: string): string {
  if (ROOT_LABELS[pathname]) {
    return ROOT_LABELS[pathname];
  }

  const projectId = extractEntityId(pathname, "/projects/");
  if (projectId) return formatBreadcrumbEntityId(projectId);

  const taskId = extractEntityId(pathname, "/tasks/");
  if (taskId) return formatBreadcrumbEntityId(taskId);

  const noteId = extractEntityId(pathname, "/notes/");
  if (noteId) return formatBreadcrumbEntityId(noteId);

  if (pathname.startsWith("/people/")) return "Person";

  return "Page";
}

export function breadcrumbPath(entry: NavigationBreadcrumb): string {
  return entry.search ? `${entry.pathname}${entry.search}` : entry.pathname;
}
