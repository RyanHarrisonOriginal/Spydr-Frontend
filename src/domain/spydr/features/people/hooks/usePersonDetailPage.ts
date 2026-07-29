import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePersonQuery,
  usePersonWorkQuery,
  useProjectsQuery,
  useProjectAreasQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { useCreateProjectForm } from "@/domain/spydr/features/projects/hooks/useCreateProjectForm";
import { useCreateTaskForm } from "@/domain/spydr/features/tasks/hooks/useCreateTaskForm";
import { useCreateTaskMutation } from "@/domain/spydr/features/tasks/hooks/useCreateTaskMutation";
import { useUpdateTaskMutation } from "@/domain/spydr/features/tasks/hooks/useUpdateTaskMutation";
import { useUpdateProjectMutation } from "@/domain/spydr/features/projects/hooks/useUpdateProjectMutation";
import { isProjectStatus } from "@/domain/spydr/utils/projectStatus";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import { useUpdatePersonMutation } from "./useUpdatePersonMutation";
import { useDeletePersonMutation } from "./useDeletePersonMutation";
import { useReorderPersonCollectionMutation } from "./useReorderPersonCollectionMutation";

export interface PersonDetailFormValues {
  fullName: string;
  body: string;
  email: string;
  title: string;
  organization: string;
  relationshipContext: string;
}

export type PersonDetailSaveState = "idle" | "pending" | "saving" | "saved" | "error";

const emptyForm: PersonDetailFormValues = {
  fullName: "",
  body: "",
  email: "",
  title: "",
  organization: "",
  relationshipContext: "",
};

const SAVE_DEBOUNCE_MS = 700;

function personToForm(person: NonNullable<ReturnType<typeof usePersonQuery>["data"]>) {
  return {
    fullName: person.details?.fullName ?? person.title,
    body: person.body,
    email: person.details?.email ?? "",
    title: person.details?.title ?? "",
    organization: person.details?.organization ?? "",
    relationshipContext: person.details?.relationshipContext ?? "",
  };
}

function serializeForm(form: PersonDetailFormValues) {
  return JSON.stringify(form);
}

export function usePersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();
  const query = usePersonQuery(personId);
  const workQuery = usePersonWorkQuery(personId);
  const projectsQuery = useProjectsQuery();
  const areasQuery = useProjectAreasQuery();
  const person = query.data;

  const invalidatePersonWork = useCallback(() => {
    if (!activeOrgId || !personId) return;
    queryClient.invalidateQueries({
      queryKey: spydrOrgKey(activeOrgId, "people", personId, "work"),
    });
  }, [activeOrgId, personId, queryClient]);

  const createProject = useCreateProjectForm({
    linkPersonAsAssignee: personId,
    onSuccess: invalidatePersonWork,
  });
  const createTask = useCreateTaskForm({
    assigneePersonNodeId: personId,
    onSuccess: invalidatePersonWork,
  });
  const createTaskMutation = useCreateTaskMutation();
  const updatePerson = useUpdatePersonMutation(personId);
  const deletePerson = useDeletePersonMutation();
  const reorderCollection = useReorderPersonCollectionMutation(personId);
  const updateTask = useUpdateTaskMutation();
  const updateProject = useUpdateProjectMutation();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [creatingTaskProjectId, setCreatingTaskProjectId] = useState<string | null>(
    null
  );
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [targetDateError, setTargetDateError] = useState<string | null>(null);
  const [taskStatusError, setTaskStatusError] = useState<string | null>(null);
  const [projectStatusError, setProjectStatusError] = useState<string | null>(null);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);
  const [form, setForm] = useState<PersonDetailFormValues>(emptyForm);
  const [saveState, setSaveState] = useState<PersonDetailSaveState>("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    hydratedRef.current = false;
    setSaveState("idle");
  }, [personId]);

  useEffect(() => {
    if (!person) return;
    setForm(personToForm(person));
    hydratedRef.current = true;
  }, [person?.id]);

  useEffect(() => {
    if (!person || !hydratedRef.current) return;

    const fromServer = personToForm(person);
    if (serializeForm(form) === serializeForm(fromServer)) return;

    setSaveState("pending");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveState("saving");
      updatePerson.mutate(
        {
          id: person.id,
          input: {
            fullName: form.fullName.trim(),
            body: form.body,
            email: form.email.trim() || null,
            title: form.title.trim() || null,
            organization: form.organization.trim() || null,
            relationshipContext: form.relationshipContext.trim() || null,
          },
        },
        {
          onSuccess: () => setSaveState("saved"),
          onError: () => setSaveState("error"),
        }
      );
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimerRef.current);
  }, [form, person, updatePerson.mutate]);

  const updateField = <TField extends keyof PersonDetailFormValues>(
    field: TField,
    value: PersonDetailFormValues[TField]
  ) => setForm((current) => ({ ...current, [field]: value }));

  const deleteCurrentPerson = () => {
    if (!person) return;
    setDeleteError(null);
    deletePerson.mutate(person.id, {
      onSuccess: () => navigate("/people"),
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete person"
        );
      },
    });
  };

  const onReorderProjects = (orderedIds: string[]) => {
    reorderCollection.mutate({ nodeType: "project", orderedIds });
  };

  const onReorderTasks = (orderedIds: string[]) => {
    reorderCollection.mutate({ nodeType: "task", orderedIds });
  };

  const updateDueDate = (taskId: string, dueDate: string | null) => {
    setDueDateError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { dueDate } },
      {
        onSuccess: () => invalidatePersonWork(),
        onError: (error) => {
          setDueDateError(
            error instanceof Error ? error.message : "Failed to update task due date"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  const updateTaskStatus = (taskId: string, status: string) => {
    if (!isTaskStatus(status)) return;
    setTaskStatusError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { status } },
      {
        onSuccess: () => invalidatePersonWork(),
        onError: (error) => {
          setTaskStatusError(
            error instanceof Error ? error.message : "Failed to update task status"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  const updateTargetDate = (projectId: string, targetDate: string | null) => {
    setTargetDateError(null);
    setUpdatingProjectId(projectId);
    updateProject.mutate(
      { projectId, input: { targetDate } },
      {
        onSuccess: () => invalidatePersonWork(),
        onError: (error) => {
          setTargetDateError(
            error instanceof Error
              ? error.message
              : "Failed to update project target date"
          );
        },
        onSettled: () => setUpdatingProjectId(null),
      }
    );
  };

  const updateProjectStatus = (projectId: string, status: string) => {
    if (!isProjectStatus(status)) return;
    setProjectStatusError(null);
    setUpdatingProjectId(projectId);
    updateProject.mutate(
      { projectId, input: { status } },
      {
        onSuccess: () => invalidatePersonWork(),
        onError: (error) => {
          setProjectStatusError(
            error instanceof Error
              ? error.message
              : "Failed to update project status"
          );
        },
        onSettled: () => setUpdatingProjectId(null),
      }
    );
  };

  const createProjectTask = (
    projectId: string,
    title: string,
    onSuccess?: () => void
  ) => {
    const trimmed = title.trim();
    if (!trimmed || !personId) return;
    setCreateTaskError(null);
    setCreatingTaskProjectId(projectId);
    createTaskMutation.mutate(
      {
        projectId,
        input: {
          title: trimmed,
          status: "active",
          priority: "medium",
          assigneePersonNodeId: personId,
        },
      },
      {
        onSuccess: () => {
          invalidatePersonWork();
          onSuccess?.();
        },
        onError: (error) => {
          setCreateTaskError(
            error instanceof Error ? error.message : "Failed to create task"
          );
        },
        onSettled: () => setCreatingTaskProjectId(null),
      }
    );
  };

  return {
    person,
    personId,
    form,
    saveState,
    updateField,
    projectEntries: workQuery.data?.projects ?? [],
    assignedTasks: workQuery.data?.tasks ?? [],
    projects: projectsQuery.data ?? [],
    projectAreas: areasQuery.data ?? [],
    createProject,
    createTask,
    createProjectTask,
    creatingTaskProjectId,
    onReorderProjects,
    onReorderTasks,
    onDueDateChange: updateDueDate,
    onTaskStatusChange: updateTaskStatus,
    onTargetDateChange: updateTargetDate,
    onProjectStatusChange: updateProjectStatus,
    updatingTaskId,
    updatingProjectId,
    dueDateError,
    taskStatusError,
    targetDateError,
    projectStatusError,
    createTaskError,
    isReorderingCollection: reorderCollection.isPending,
    deleteCurrentPerson,
    isDeleting: deletePerson.isPending,
    deleteError,
    isLoading: query.isLoading || workQuery.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load person",
  };
}
