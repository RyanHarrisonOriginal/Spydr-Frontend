import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { TodoItem, TodoItemSource } from "@/domain/spydr/utils/types";

export function useAddTodoItemMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (input: { taskId: string; source?: TodoItemSource }) =>
      spydrApi.todos.add(input),
    onSuccess: (item) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<TodoItem[]>(
        spydrOrgKey(activeOrgId, "todos"),
        (current) => {
          if (!current) return [item];
          if (current.some((entry) => entry.id === item.id)) {
            return current.map((entry) => (entry.id === item.id ? item : entry));
          }
          return [...current, item];
        }
      );
    },
  });
}

export function useRemoveTodoItemMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (input: { todoId?: string; taskId?: string }) => {
      if (input.todoId) return spydrApi.todos.remove(input.todoId);
      if (input.taskId) return spydrApi.todos.removeByTask(input.taskId);
      return Promise.reject(new Error("todoId or taskId is required"));
    },
    onSuccess: (_void, variables) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<TodoItem[]>(
        spydrOrgKey(activeOrgId, "todos"),
        (current) => {
          if (!current) return current;
          return current.filter((entry) => {
            if (variables.todoId) return entry.id !== variables.todoId;
            if (variables.taskId) return entry.taskId !== variables.taskId;
            return true;
          });
        }
      );
    },
  });
}
