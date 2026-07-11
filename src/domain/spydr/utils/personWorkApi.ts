import type { ProjectNode, TaskNode } from "./types";
import type { ProjectPersonaRole } from "./projectPersonas";

export interface PersonWorkProjectEntry {
  project: ProjectNode;
  roles: ProjectPersonaRole[];
  sortOrder: number;
  personSortOrder: number | null;
  globalRank: number;
  personRank: number;
}

export interface PersonWorkTaskEntry {
  task: TaskNode;
  sortOrder: number;
  personSortOrder: number | null;
  globalRank: number;
  personRank: number;
}

export interface PersonWork {
  projects: PersonWorkProjectEntry[];
  tasks: PersonWorkTaskEntry[];
}

export type PersonCollectionNodeType = "project" | "task";
