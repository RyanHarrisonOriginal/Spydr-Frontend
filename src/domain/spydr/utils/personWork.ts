import type { ProjectNode, TaskNode } from "./types";
import {
  projectPersonaLabels,
  type ProjectPersonaRole,
} from "./projectPersonas";

export function getPersonProjectRoles(
  project: ProjectNode,
  personId: string
): ProjectPersonaRole[] {
  const details = project.details;
  if (!details) return [];

  const roles: ProjectPersonaRole[] = [];
  if (details.requesterPersonNodeId === personId) roles.push("requester");
  if (details.assigneePersonNodeId === personId) roles.push("assignee");
  if (details.sponsorPersonNodeId === personId) roles.push("sponsor");
  if (details.reviewerPersonNodeId === personId) roles.push("reviewer");
  return roles;
}

export function projectInvolvesPerson(project: ProjectNode, personId: string): boolean {
  return getPersonProjectRoles(project, personId).length > 0;
}

export function taskAssignedToPerson(task: TaskNode, personId: string): boolean {
  return (task.assignee?.id ?? task.details?.assigneePersonNodeId) === personId;
}

export function formatPersonProjectRoles(roles: ProjectPersonaRole[]): string {
  return roles.map((role) => projectPersonaLabels[role]).join(", ");
}

export function listPersonProjects(projects: ProjectNode[], personId: string) {
  return projects
    .filter((project) => projectInvolvesPerson(project, personId))
    .map((project) => ({
      project,
      roles: getPersonProjectRoles(project, personId),
    }))
    .sort((left, right) => left.project.title.localeCompare(right.project.title));
}

export function listPersonTasks(tasks: TaskNode[], personId: string) {
  return tasks
    .filter((task) => taskAssignedToPerson(task, personId))
    .sort((left, right) => {
      const leftDue = left.details?.dueDate ?? "";
      const rightDue = right.details?.dueDate ?? "";
      if (leftDue && rightDue && leftDue !== rightDue) {
        return leftDue.localeCompare(rightDue);
      }
      return left.title.localeCompare(right.title);
    });
}

export function isOpenTask(task: TaskNode): boolean {
  return task.status !== "completed" && task.status !== "archived";
}

/** Owned = assignee — primary person doing the work. */
export function isPersonOwnedProject(roles: ProjectPersonaRole[]): boolean {
  return roles.includes("assignee");
}
