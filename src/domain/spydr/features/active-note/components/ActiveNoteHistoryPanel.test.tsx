import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ActiveNoteHistoryPanel } from "./ActiveNoteHistoryPanel";
import type { ActiveNoteHistoryItem } from "@/domain/spydr/utils/activeNoteTypes";

const notes: ActiveNoteHistoryItem[] = [
  {
    id: "session-1",
    content: "Throw more teeps tonight.",
    status: "completed",
    createdAt: "2026-09-04T12:00:00.000Z",
    updatedAt: "2026-09-04T12:10:00.000Z",
    completedAt: "2026-09-04T12:10:00.000Z",
    suggestions: [
      {
        id: "op-0",
        title: "Drill teeps",
        objectType: "task",
        decision: "accepted",
      },
      {
        id: "op-1",
        title: "Sparring note",
        objectType: "note",
        decision: "rejected",
      },
    ],
  },
];

describe("ActiveNoteHistoryPanel", () => {
  it("links each past note to its detail page and shows apply status", () => {
    render(
      <MemoryRouter>
        <ActiveNoteHistoryPanel notes={notes} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: /throw more teeps tonight/i })
    ).toHaveAttribute("href", "/active-note/session-1");
    expect(screen.getByText("1/2 applied")).toBeInTheDocument();
  });
});
