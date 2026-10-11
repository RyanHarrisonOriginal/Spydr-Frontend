import { describe, expect, it } from "vitest";
import { resolveWorkGridLayout } from "@/domain/spydr/features/shared/utils/fitGridTracks";
import {
  essentialTracksOverflow,
  shedOptionalColumns,
} from "@/domain/spydr/features/shared/utils/shedOptionalColumns";
import {
  PROJECT_COLUMN_DROP_ORDER,
  optionalProjectColumns,
  type ProjectColumnId,
} from "@/domain/spydr/features/projects/hooks/useProjectListColumns";
import {
  PROJECT_LIST_COLUMN_DEFAULTS,
  PROJECT_LIST_PADDING_X,
  buildProjectTracks,
} from "@/domain/spydr/features/projects/utils/projectListLayout";
import {
  TASK_COLUMN_DROP_ORDER,
  TASK_LIST_COLUMN_DEFAULTS,
  TASK_LIST_PADDING_X,
  TASK_OPTIONAL_COLUMNS,
  buildTaskTracks,
} from "@/domain/spydr/features/tasks/utils/taskListLayout";
import {
  NARROW_DESKTOP_BREAKPOINT_PX,
  PHONE_BREAKPOINT_PX,
} from "@/lib/mediaQuery";

/** Sidebar widths from Sidebar.tsx. */
const SIDEBAR_EXPANDED = 224; // w-56
const SIDEBAR_COLLAPSED = 56; // w-14

/**
 * Effective CSS viewports from the zoom matrix, plus browser-zoom proxies.
 * At ≤1279px the rail auto-collapses; above that it may be expanded.
 */
const VIEWPORTS = [
  {
    name: "1920x1080 @100%",
    width: 1920,
    height: 1080,
    sidebar: SIDEBAR_EXPANDED,
  },
  {
    name: "1536x864 (1920 @125%)",
    width: 1536,
    height: 864,
    sidebar: SIDEBAR_EXPANDED,
  },
  {
    name: "1280x720 (1920 @150%)",
    width: 1280,
    height: 720,
    // Auto-collapse kicks in below 1280 — at exactly 1280 rail may stay open;
    // assert both content budgets stay usable after shed.
    sidebar: SIDEBAR_EXPANDED,
  },
  {
    name: "1279x720 (just under auto-collapse)",
    width: 1279,
    height: 720,
    sidebar: SIDEBAR_COLLAPSED,
  },
  {
    name: "1097x617 (1920 @175%)",
    width: 1097,
    height: 617,
    sidebar: SIDEBAR_COLLAPSED,
  },
  {
    name: "1280x800 browser zoom 150% ≈ 853x533",
    width: Math.round(1280 / 1.5),
    height: Math.round(800 / 1.5),
    sidebar: SIDEBAR_COLLAPSED,
  },
  {
    name: "1280x800 browser zoom 200% ≈ 640x400",
    width: Math.round(1280 / 2),
    height: Math.round(800 / 2),
    sidebar: SIDEBAR_COLLAPSED,
  },
] as const;

const ALL_PROJECT_COLUMNS = optionalProjectColumns.map(
  (column) => column.id
) as ProjectColumnId[];

function projectContentWidth(viewportWidth: number, sidebar: number) {
  return Math.max(0, viewportWidth - sidebar);
}

function evaluateProjectList(availableWidth: number) {
  const build = (optional: ProjectColumnId[]) =>
    buildProjectTracks(
      optional,
      PROJECT_LIST_COLUMN_DEFAULTS,
      true,
      true
    );
  const kept = shedOptionalColumns(
    ALL_PROJECT_COLUMNS,
    PROJECT_COLUMN_DROP_ORDER,
    build,
    availableWidth,
    PROJECT_LIST_PADDING_X
  );
  const layout = resolveWorkGridLayout(
    build(kept),
    availableWidth,
    PROJECT_LIST_PADDING_X
  );
  const useCards = essentialTracksOverflow(
    build([]),
    availableWidth,
    PROJECT_LIST_PADDING_X
  );
  return { kept, layout, useCards };
}

function evaluateTaskList(availableWidth: number) {
  const build = (optional: (typeof TASK_OPTIONAL_COLUMNS)[number][]) =>
    buildTaskTracks(TASK_LIST_COLUMN_DEFAULTS, true, optional);
  const kept = shedOptionalColumns(
    TASK_OPTIONAL_COLUMNS,
    TASK_COLUMN_DROP_ORDER,
    build,
    availableWidth,
    TASK_LIST_PADDING_X
  );
  const layout = resolveWorkGridLayout(
    build(kept),
    availableWidth,
    TASK_LIST_PADDING_X
  );
  const useCards = essentialTracksOverflow(
    build([]),
    availableWidth,
    TASK_LIST_PADDING_X
  );
  return { kept, layout, useCards };
}

describe("Work layout viewport matrix", () => {
  it("keeps the phone / narrow-desktop breakpoints aligned with the zoom plan", () => {
    expect(PHONE_BREAKPOINT_PX).toBe(768);
    expect(NARROW_DESKTOP_BREAKPOINT_PX).toBe(1280);
  });

  for (const viewport of VIEWPORTS) {
    it(`${viewport.name}: project list does not force page-level H-scroll`, () => {
      const available = projectContentWidth(viewport.width, viewport.sidebar);
      const { layout, useCards } = evaluateProjectList(available);

      if (useCards) {
        // Card / wrap layout — no minWidth scroll track.
        expect(layout.scrollMinWidth).toBeUndefined();
        return;
      }

      // Table mode must fit after shedding (no in-pane H-scroll required).
      expect(layout.overflows).toBe(false);
      expect(layout.scrollMinWidth).toBeUndefined();
    });

    it(`${viewport.name}: task list does not force page-level H-scroll`, () => {
      const available = projectContentWidth(viewport.width, viewport.sidebar);
      const { layout, useCards } = evaluateTaskList(available);

      if (useCards) {
        expect(layout.scrollMinWidth).toBeUndefined();
        return;
      }

      expect(layout.overflows).toBe(false);
      expect(layout.scrollMinWidth).toBeUndefined();
    });
  }

  it("1280x720 with expanded sidebar sheds before scrolling", () => {
    const available = projectContentWidth(1280, SIDEBAR_EXPANDED);
    const { kept, layout, useCards } = evaluateProjectList(available);
    expect(useCards).toBe(false);
    expect(layout.overflows).toBe(false);
    expect(kept.length).toBeLessThan(ALL_PROJECT_COLUMNS.length);
  });

  it("1097x617 with collapsed sidebar keeps a usable project table or cards", () => {
    const available = projectContentWidth(1097, SIDEBAR_COLLAPSED);
    const { layout, useCards } = evaluateProjectList(available);
    if (!useCards) {
      expect(layout.overflows).toBe(false);
    }
  });

  it("640 CSS px (200% zoom proxy) falls back to cards rather than a clipped table", () => {
    const available = projectContentWidth(640, SIDEBAR_COLLAPSED);
    const project = evaluateProjectList(available);
    const tasks = evaluateTaskList(available);
    expect(project.useCards || !project.layout.overflows).toBe(true);
    expect(tasks.useCards || !tasks.layout.overflows).toBe(true);
  });
});
