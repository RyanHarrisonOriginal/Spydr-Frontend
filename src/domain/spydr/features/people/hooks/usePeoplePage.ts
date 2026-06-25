import { useMemo, useState } from "react";
import { usePeopleQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCreatePersonMutation } from "./useCreatePersonMutation";

export function usePeoplePage() {
  const query = usePeopleQuery();
  const createPerson = useCreatePersonMutation();
  const people = query.data ?? [];
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const totalCount = useMemo(() => people.length, [people.length]);

  const submitCreate = (values: {
    fullName: string;
    email: string;
    title: string;
    organization: string;
  }) => {
    const fullName = values.fullName.trim();
    if (!fullName) return;

    setCreateError(null);
    createPerson.mutate(
      {
        fullName,
        email: values.email.trim() || null,
        title: values.title.trim() || null,
        organization: values.organization.trim() || null,
      },
      {
        onSuccess: () => setIsCreateOpen(false),
        onError: (error) => {
          setCreateError(
            error instanceof Error ? error.message : "Failed to create person"
          );
        },
      }
    );
  };

  return {
    people,
    totalCount,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load people",
    isCreateOpen,
    setIsCreateOpen,
    createError,
    isCreating: createPerson.isPending,
    submitCreate,
  };
}
