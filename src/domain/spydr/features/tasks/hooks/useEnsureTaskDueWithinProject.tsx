import { useState } from "react";
import { useUpdateProjectMutation } from "@/domain/spydr/features/projects/hooks/useUpdateProjectMutation";
import { isDueAfterProjectTarget, toDateOnlyKey } from "@/domain/spydr/utils/taskDueVsProject";
import { ExtendProjectTargetDialog } from "../components/ExtendProjectTargetDialog";

export interface TaskDueProjectRef {
  id: string;
  title: string;
  details?: { targetDate?: string | null } | null;
}

interface EnsureTaskDueArgs {
  project?: TaskDueProjectRef | null;
  dueDate: string | null;
  onAllowed(): void | Promise<void>;
}

export function useEnsureTaskDueWithinProject() {
  const updateProject = useUpdateProjectMutation();
  const [prompt, setPrompt] = useState<{
    project: TaskDueProjectRef;
    dueDate: string;
    onAllowed(): void | Promise<void>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensure = ({ project, dueDate, onAllowed }: EnsureTaskDueArgs) => {
    if (!isDueAfterProjectTarget(dueDate, project?.details?.targetDate)) {
      void onAllowed();
      return;
    }
    if (!project || !dueDate) {
      void onAllowed();
      return;
    }

    const normalizedDue = toDateOnlyKey(dueDate) ?? dueDate;
    setError(null);
    setPrompt({ project, dueDate: normalizedDue, onAllowed });
  };

  const confirm = async () => {
    if (!prompt) return;

    setError(null);
    try {
      await updateProject.mutateAsync({
        projectId: prompt.project.id,
        input: { targetDate: prompt.dueDate },
      });
      const { onAllowed } = prompt;
      setPrompt(null);
      await onAllowed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extend project");
    }
  };

  const dialog = (
    <ExtendProjectTargetDialog
      open={Boolean(prompt)}
      projectTitle={prompt?.project.title ?? ""}
      projectTargetDate={prompt?.project.details?.targetDate ?? null}
      requestedDueDate={prompt?.dueDate ?? ""}
      isExtending={updateProject.isPending}
      error={error}
      onConfirm={() => {
        void confirm();
      }}
      onCancel={() => {
        if (updateProject.isPending) return;
        setPrompt(null);
        setError(null);
      }}
    />
  );

  return { ensure, dialog, isExtending: updateProject.isPending };
}
