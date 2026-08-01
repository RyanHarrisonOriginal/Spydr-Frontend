import type { SpydrObjectType } from "./activeNoteTypes";

export function objectHref(type: SpydrObjectType, id: string): string {
  switch (type) {
    case "project":
      return `/projects/${id}`;
    case "task":
      return `/tasks/${id}`;
    case "note":
      return `/notes/${id}`;
    case "decision":
      return `/decisions`;
    case "idea":
      return `/ideas`;
    case "person":
      return `/people/${id}`;
    case "goal":
      return `/projects/${id}`;
    case "relationship":
      return "/active-note";
    default:
      return "/notes";
  }
}
