import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetActiveNoteMocks } from "@/domain/spydr/utils/activeNoteMocks";
import { ActiveNotePage } from "./ActiveNotePage";

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
      {
        id: "proj-competition",
        title: "Competition Preparation",
        nodeType: "project",
        status: "active",
        area: null,
        sortOrder: 1,
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useTasksQuery: () => ({
    data: [
      {
        id: "task-teep",
        title: "Practice teep setups",
        nodeType: "task",
        status: "active",
        sortOrder: 0,
        project: { id: "proj-muay-thai", title: "Muay Thai Development" },
      },
      {
        id: "task-done",
        title: "Completed sparring review",
        nodeType: "task",
        status: "completed",
        sortOrder: 1,
        project: { id: "proj-muay-thai", title: "Muay Thai Development" },
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useActiveNotesHistoryQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
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

vi.mock("@/domain/spydr/utils/activeNoteApi", async () => {
  const mocks = await import("@/domain/spydr/utils/activeNoteMocks");

  async function analyze(input: {
    content: string;
    projectId?: string | null;
    activeNote?: { id: string } | null;
  }) {
    let noteId = input.activeNote?.id;
    if (!noteId) {
      const created = await mocks.mockCreateActiveNote({
        content: input.content,
        projectId: input.projectId,
      });
      noteId = created.id;
    } else {
      await mocks.mockUpdateActiveNote(noteId, {
        content: input.content,
        projectId: input.projectId,
      });
    }
    return mocks.mockAnalyzeActiveNote(noteId);
  }

  return {
    isActiveNoteMockMode: () => true,
    createActiveNote: mocks.mockCreateActiveNote,
    updateActiveNote: mocks.mockUpdateActiveNote,
    analyzeActiveNote: analyze,
    getActiveNoteProposal: mocks.mockGetActiveNoteProposal,
    applyActiveNoteProposal: mocks.mockApplyActiveNoteProposal,
    activeNoteApi: {
      create: mocks.mockCreateActiveNote,
      update: mocks.mockUpdateActiveNote,
      analyze,
      getProposal: mocks.mockGetActiveNoteProposal,
      apply: mocks.mockApplyActiveNoteProposal,
    },
  };
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ActiveNotePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ActiveNotePage", () => {
  beforeEach(() => {
    resetActiveNoteMocks();
  });

  it("shows an agent capability disclaimer", () => {
    renderPage();

    expect(
      screen.getByLabelText(/active note agent disclaimer/i)
    ).toHaveTextContent(/still working on the Active Note agent/i);
  });

  it("lets a user enter, save, analyze, edit, reject, resolve duplicates, and apply", async () => {
    const user = userEvent.setup();
    renderPage();

    const noteInput = screen.getByLabelText("Your note");
    await user.type(
      noteInput,
      "Last night I sparred a big guy and had problems landing a teep."
    );

    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Analyze note" }));
    expect(await screen.findByText(/analyzing note/i)).toBeInTheDocument();

    expect(
      await screen.findByText(/active note review/i, {}, { timeout: 4000 })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Difficulty landing teeps against larger opponents/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText((_, element) => {
        return (
          element?.tagName === "SPAN" &&
          element.textContent?.trim().toLowerCase() === "person"
        );
      })
    ).not.toBeInTheDocument();

    const noteCard = (document.querySelector(
      'article[data-operation-type="attach_context"]'
    ) ??
      document.querySelector(
        'article[data-operation-type="create"]'
      )) as HTMLElement;
    expect(noteCard).toBeTruthy();
    const noteAccept = within(noteCard).getByRole("checkbox", {
      name: /accept:|deselect:/i,
    });
    expect(noteAccept).toBeChecked();

    const suggestedCard = document.querySelector(
      'article[data-operation-type="suggest_create"]'
    ) as HTMLElement;
    expect(suggestedCard).toBeTruthy();
    const suggestedAccept = within(suggestedCard).getByRole("checkbox", {
      name: /accept:|deselect:/i,
    });
    expect(suggestedAccept).not.toBeChecked();

    await user.click(
      within(suggestedCard).getByRole("radio", {
        name: /create a new task/i,
      })
    );
    expect(suggestedAccept).toBeChecked();

    await user.click(
      within(suggestedCard).getByRole("button", { name: "Edit" })
    );
    const titleInput = await screen.findByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Drill teep setups vs larger partners");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(/Drill teep setups vs larger partners/i)
    ).toBeInTheDocument();

    const linkCard = document.querySelector(
      'article[data-operation-type="link"]'
    ) as HTMLElement;
    expect(linkCard).toBeTruthy();
    await user.click(within(linkCard).getByRole("button", { name: "Reject" }));

    const applyButton = screen.getByRole("button", {
      name: /apply \d+ selected/i,
    });
    expect(applyButton).not.toBeDisabled();
    expect(applyButton).toHaveAccessibleName(/apply \d+ selected/i);

    await user.click(applyButton);

    expect(
      await screen.findByText(/active note processed/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Drill teep setups vs larger partners/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to notes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create another active note/i })
    ).toBeInTheDocument();
  });

  it("keeps the sticky apply action available in the document", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByLabelText("Your note"),
      "Practice teep setups before Thursday sparring."
    );
    await user.click(screen.getByRole("button", { name: "Analyze note" }));

    expect(
      await screen.findByRole(
        "button",
        { name: /apply \d+ selected/i },
        { timeout: 4000 }
      )
    ).toBeInTheDocument();
  });

  it("preserves edits when apply fails", async () => {
    const user = userEvent.setup();
    const api = await import("@/domain/spydr/utils/activeNoteApi");
    const applySpy = vi
      .spyOn(api.activeNoteApi, "apply")
      .mockRejectedValue(new Error("Apply failed"));

    try {
      renderPage();
      await user.type(
        screen.getByLabelText("Your note"),
        "Practice teep setups before Thursday sparring."
      );
      await user.click(screen.getByRole("button", { name: "Analyze note" }));

      await screen.findByText(/active note review/i, {}, { timeout: 4000 });
      const taskCard = await waitFor(() => {
        const card = document.querySelector(
          'article[data-operation-id="op-task-explicit"]'
        ) as HTMLElement | null;
        if (!card) throw new Error("Task proposal card not found");
        return card;
      });
      await user.click(within(taskCard).getByRole("button", { name: "Edit" }));
      const titleInput = await screen.findByLabelText("Title");
      await user.clear(titleInput);
      await user.type(titleInput, "Edited explicit task");
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await user.click(
        screen.getByRole("button", { name: /apply \d+ selected/i })
      );

      expect(applySpy).toHaveBeenCalled();
      expect(
        await screen.findByText(/apply failed|could not apply/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Edited explicit task/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/active note review/i)).toBeInTheDocument();
    } finally {
      applySpy.mockRestore();
    }
  });
});
