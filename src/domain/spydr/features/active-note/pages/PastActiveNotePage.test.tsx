import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActiveNoteProposal } from "@/domain/spydr/utils/activeNoteTypes";
import { PastActiveNotePage } from "./PastActiveNotePage";

const pastProposal: ActiveNoteProposal = {
  activeNote: {
    id: "session-1",
    content: "Throw more teeps tonight after sparring.",
    projectId: "proj-muay-thai",
    status: "completed",
    createdAt: "2026-09-04T12:00:00.000Z",
    updatedAt: "2026-09-04T12:10:00.000Z",
  },
  summary: "Two segments",
  operations: [
    {
      id: "op-0",
      operationType: "create",
      objectType: "task",
      payload: {
        kind: "task",
        title: "Drill teep setups",
        projectId: "proj-muay-thai",
      },
      confidence: 0.9,
      evidence: ["Throw more teeps tonight after sparring."],
      explicitlyStated: true,
      status: "executed",
      selected: false,
      selectedProjectId: "proj-muay-thai",
      applyDecision: "accepted",
      appliedObject: {
        id: "task-1",
        type: "task",
        title: "Drill teep setups",
        action: "created",
        href: "/tasks/task-1",
        operationId: "op-0",
      },
    },
    {
      id: "op-1",
      operationType: "create",
      objectType: "note",
      payload: {
        kind: "note",
        title: "Sparring recap",
        content: "Throw more teeps tonight after sparring.",
        projectId: "proj-muay-thai",
      },
      confidence: 0.8,
      evidence: ["Throw more teeps tonight after sparring."],
      explicitlyStated: false,
      status: "proposed",
      selected: false,
      selectedProjectId: "proj-muay-thai",
      applyDecision: "rejected",
    },
  ],
  warnings: [],
};

const applyMock = vi.fn();

vi.mock("@/domain/spydr/features/shared/hooks/queries", () => ({
  useProjectsQuery: () => ({
    data: [
      {
        id: "proj-muay-thai",
        title: "Muay Thai Development",
        nodeType: "project",
        status: "active",
        area: "Training",
        sortOrder: 0,
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useTasksQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useNotesQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useActiveNoteSessionQuery: () => ({
    data: pastProposal,
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

vi.mock(
  "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext",
  () => ({
    usePageBreadcrumb: () => undefined,
    useNavigationBreadcrumbs: () => ({ stack: [] }),
  })
);

vi.mock(
  "@/domain/spydr/features/organizations/context/OrganizationContext",
  () => ({
    useOrganizationContext: () => ({
      activeOrgId: "org-test",
      isReady: true,
    }),
  })
);

vi.mock("@/domain/spydr/utils/activeNoteApi", () => ({
  activeNoteApi: {
    apply: (...args: unknown[]) => applyMock(...args),
  },
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/active-note/session-1"]}>
        <Routes>
          <Route
            path="/active-note/:sessionId"
            element={<PastActiveNotePage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PastActiveNotePage", () => {
  beforeEach(() => {
    applyMock.mockReset();
    applyMock.mockResolvedValue({
      activeNote: {
        ...pastProposal.activeNote,
        status: "completed",
      },
      applied: [
        {
          id: "note-1",
          type: "note",
          title: "Sparring recap",
          action: "created",
          href: "/notes/note-1",
          operationId: "op-1",
        },
      ],
      failed: [],
      partial: false,
    });
  });

  it("shows apply status and lets the user apply a suggestion for the first time", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText("Past Active Note")).toBeInTheDocument();
    const noteEditor = screen.getByRole("textbox", { name: /original note/i });
    expect(noteEditor).toHaveTextContent(/throw more teeps tonight/i);
    expect(noteEditor).toHaveAttribute("contenteditable", "false");
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Not applied")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /applied/i })
    ).toHaveAttribute("href", "/tasks/task-1");

    const noteCard = document.querySelector(
      '[data-operation-id="op-1"]'
    ) as HTMLElement;
    expect(noteCard).toBeTruthy();
    const checkbox = within(noteCard).getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    await user.click(
      screen.getByRole("button", { name: /apply 1 selected changes/i })
    );

    expect(applyMock).toHaveBeenCalledWith(
      "session-1",
      expect.objectContaining({
        operations: expect.arrayContaining([
          expect.objectContaining({
            operationId: "op-1",
            selected: true,
          }),
          expect.objectContaining({
            operationId: "op-0",
            selected: false,
          }),
        ]),
      })
    );
    expect(
      await screen.findByText(/1 suggestion was written/i)
    ).toBeInTheDocument();
  });
});
