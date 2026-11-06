import { endOfWeek, isBefore, startOfDay } from "date-fns";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import type { WorkPulseCounts } from "../components/WorkPulse";

function isOpen(status: string): boolean {
  return !isClosedCollectionStatus(status);
}

function dueBetweenTodayAndWeekEnd(
  dueDate: string | null | undefined,
  today: Date,
  weekEnd: Date
): boolean {
  if (!dueDate) return false;
  const due = parseCalendarDate(dueDate) ?? new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const day = startOfDay(due);
  if (isBefore(day, today)) return false;
  return !isBefore(weekEnd, day);
}

function isPastToday(dueDate: string | null | undefined, today: Date): boolean {
  if (!dueDate) return false;
  const due = parseCalendarDate(dueDate) ?? new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return isBefore(startOfDay(due), today);
}

/**
 * Pulse from the same rows shown under current filters.
 * Counts open tasks AND projects: overdue (due/target before today),
 * blocked status, due this week (today → end of week).
 */
export function countVisiblePulse(
  projects: ProjectNode[],
  tasks: TaskNode[],
  now = new Date()
): WorkPulseCounts {
  const today = startOfDay(now);
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  let overdue = 0;
  let blocked = 0;
  let dueThisWeek = 0;

  for (const project of projects) {
    if (!isOpen(project.status)) continue;
    if (project.status === "blocked") blocked += 1;
    const target = project.details?.targetDate;
    if (isPastToday(target, today)) overdue += 1;
    else if (dueBetweenTodayAndWeekEnd(target, today, weekEnd)) dueThisWeek += 1;
  }

  for (const task of tasks) {
    if (!isOpen(task.status)) continue;
    if (task.status === "blocked") blocked += 1;
    const due = task.details?.dueDate;
    if (isPastToday(due, today)) overdue += 1;
    else if (dueBetweenTodayAndWeekEnd(due, today, weekEnd)) dueThisWeek += 1;
  }

  return { overdue, blocked, dueThisWeek };
}
