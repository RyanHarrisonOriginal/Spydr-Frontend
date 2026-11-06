import { describe, expect, it } from "vitest";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { countVisiblePulse } from "./workPulse";

function project(
  id: string,
  status: string,
  targetDate: string | null
): ProjectNode {
  return {
    id,
    status,
    details: { targetDate },
  } as ProjectNode;
}

function task(id: string, status: string, dueDate: string | null): TaskNode {
  return {
    id,
    status,
    details: { dueDate },
  } as TaskNode;
}

describe("countVisiblePulse", () => {
  const now = new Date(2026, 10, 5); // Thursday Nov 5

  it("counts open projects and tasks together", () => {
    const counts = countVisiblePulse(
      [
        project("p1", "active", "2026-10-01"), // overdue
        project("p2", "blocked", "2026-11-06"), // blocked + this week
        project("p3", "completed", "2026-10-01"), // closed — ignored
      ],
      [
        task("t1", "active", "2026-11-04"), // overdue
        task("t2", "active", "2026-11-07"), // this week
        task("t3", "blocked", null), // blocked only
      ],
      now
    );

    expect(counts).toEqual({
      overdue: 2,
      blocked: 2,
      dueThisWeek: 2,
    });
  });
});
