import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { CreatePersonDialog } from "../components/CreatePersonDialog";
import { PersonList } from "../components/PersonList";
import { usePeoplePage } from "../hooks/usePeoplePage";

export function PeoplePage() {
  const {
    people,
    view,
    reorder,
    getPriorityRank,
    totalCount,
    isLoading,
    isError,
    errorMessage,
    isCreateOpen,
    setIsCreateOpen,
    createError,
    isCreating,
    submitCreate,
    deleteError,
    deletePerson,
    deletingPersonId,
  } = usePeoplePage();
  const { currentUserPerson, isReady: isCurrentUserReady, primaryClerkEmail } =
    useCurrentUserPerson();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="People"
        meta={<span>{totalCount} contacts</span>}
        actions={
          <CreatePersonDialog
            open={isCreateOpen}
            isSubmitting={isCreating}
            errorMessage={createError}
            onOpenChange={setIsCreateOpen}
            onSubmit={submitCreate}
          />
        }
      />
      {isLoading && <LoadingState title="Loading people" />}
      {isError && <ErrorState title="People unavailable" description={errorMessage} />}
      {!isLoading && !isError && people.length === 0 && (
        <EmptyState
          title="No people yet"
          description="Add teammates, stakeholders, and contacts to assign on projects."
        />
      )}
      {!isLoading && !isError && people.length > 0 && (
        <>
          {deleteError ? (
            <p className="px-6 pb-2 text-sm text-destructive">{deleteError}</p>
          ) : null}
          {isCurrentUserReady && !currentUserPerson && primaryClerkEmail ? (
            <p className="px-6 pb-2 text-[12px] text-muted-foreground">
              No person record matches your Clerk email ({primaryClerkEmail}). Add yourself
              with that email to see the <span className="text-highlight">You</span> badge.
            </p>
          ) : null}
          <CollectionToolbar view={view} />
          {view.items.length > 0 ? (
            <PersonList
              people={view.items}
              sort={view.state.sort}
              getPriorityRank={getPriorityRank}
              reorderEnabled={reorder.canReorder}
              onSortColumn={view.toggleSort}
              onReorder={reorder.onReorder}
              onDelete={deletePerson}
              deletingPersonId={deletingPersonId}
            />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
