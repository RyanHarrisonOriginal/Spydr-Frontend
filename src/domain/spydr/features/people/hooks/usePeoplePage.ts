import { useState } from "react";
import { usePeopleQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { useGetPriorityRank } from "@/domain/spydr/features/shared/hooks/usePriorityRankLookup";
import { peopleCollection } from "@/domain/spydr/utils/collections/peopleCollection";
import { useCreatePersonMutation } from "./useCreatePersonMutation";

export function usePeoplePage() {
  const query = usePeopleQuery();
  const createPerson = useCreatePersonMutation();
  const people = query.data ?? [];
  const view = useCollectionView(peopleCollection, people);
  const reorder = useCollectionReorder("person", view);
  const getPriorityRank = useGetPriorityRank(people);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const totalCount = people.length;

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
    view,
    reorder,
    getPriorityRank,
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
