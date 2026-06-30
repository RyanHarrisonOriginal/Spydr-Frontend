import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { WorkspaceGraphCanvas } from "../components/WorkspaceGraphCanvas";
import { useGraphPage } from "../hooks/useGraphPage";

export function GraphPage() {
  const {
    nodes,
    edges,
    filters,
    toggleFilter,
    stats,
    isLoading,
    isError,
    errorMessage,
    partialErrors,
    layoutKey,
  } = useGraphPage();

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col overflow-hidden">
      <PageHeader
        className="shrink-0"
        eyebrow="Meta"
        title="Graph"
        meta={
          !isLoading && !isError ? (
            <span>
              {stats.nodeCount} nodes · {stats.edgeCount} connections
            </span>
          ) : undefined
        }
      />

      {isLoading && <LoadingState title="Mapping workspace" />}

      {!isLoading && isError && (
        <ErrorState title="Graph unavailable" description={errorMessage} />
      )}

      {!isLoading && !isError && stats.nodeCount === 0 && (
        <EmptyState
          title="Nothing to map yet"
          description="Add projects, tasks, or people and their connections will appear here."
        />
      )}

      {!isLoading && !isError && stats.nodeCount > 0 && (
        <div className="relative min-h-0 flex-1 border-t border-border">
          {partialErrors > 0 ? (
            <div className="absolute inset-x-0 top-0 z-20 border-b border-border/70 bg-muted/40 px-4 py-1.5 text-center text-[11px] text-muted-foreground">
              Some data could not be loaded — showing partial graph.
            </div>
          ) : null}
          <WorkspaceGraphCanvas
            nodes={nodes}
            edges={edges}
            filters={filters}
            layoutKey={layoutKey}
            onToggleFilter={toggleFilter}
          />
        </div>
      )}
    </div>
  );
}
