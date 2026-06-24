import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import { nextAreaPresetColor } from "@/domain/spydr/utils/projectAreaColors";
import { cn } from "@/lib/utils";
import { useCreateProjectAreaMutation } from "../hooks/useCreateProjectAreaMutation";
import { useDeleteProjectAreaMutation } from "../hooks/useDeleteProjectAreaMutation";
import { useUpdateProjectAreaMutation } from "../hooks/useUpdateProjectAreaMutation";
import { ProjectAreaChip } from "./ProjectAreaChip";

interface ProjectAreasPanelProps {
  areas: ProjectAreaNode[];
  isLoading?: boolean;
}

export function ProjectAreasPanel({ areas, isLoading = false }: ProjectAreasPanelProps) {
  const [expanded, setExpanded] = useState(areas.length === 0);
  const [draftTitle, setDraftTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createArea = useCreateProjectAreaMutation();
  const deleteArea = useDeleteProjectAreaMutation();
  const updateArea = useUpdateProjectAreaMutation();

  const isBusy =
    isLoading ||
    createArea.isPending ||
    deleteArea.isPending ||
    updateArea.isPending;

  const addArea = () => {
    const title = draftTitle.trim();
    if (!title) return;

    setError(null);
    createArea.mutate(
      { title, color: nextAreaPresetColor(areas.length) },
      {
        onSuccess: () => {
          setDraftTitle("");
          setExpanded(true);
        },
        onError: (mutationError) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : "Failed to add project area"
          );
        },
      }
    );
  };

  const removeArea = (area: ProjectAreaNode) => {
    if (
      !window.confirm(
        `Remove area "${area.title}"? Projects using it will have their area cleared.`
      )
    ) {
      return;
    }

    setError(null);
    deleteArea.mutate(area.id, {
      onError: (mutationError) => {
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "Failed to remove project area"
        );
      },
    });
  };

  const changeColor = (areaId: string, color: string) => {
    setError(null);
    updateArea.mutate(
      { areaId, input: { color } },
      {
        onError: (mutationError) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : "Failed to update area color"
          );
        },
      }
    );
  };

  const areaSummary =
    areas.length === 0
      ? "None defined"
      : `${areas.length} area${areas.length === 1 ? "" : "s"}`;

  return (
    <section className="border-b border-border/80 px-6 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              !expanded && "-rotate-90"
            )}
            aria-hidden
          />
          Areas
          <span className="text-muted-foreground/70">· {areaSummary}</span>
        </button>

        {!expanded ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(true)}
            className="ml-auto h-7 gap-1 px-2 text-[11px] text-muted-foreground"
          >
            <Plus className="h-3 w-3" />
            Manage
          </Button>
        ) : (
          <>
            <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:flex-1">
              {isLoading ? (
                <span className="text-[11px] text-muted-foreground">Loading…</span>
              ) : null}
              {!isLoading && areas.length === 0 ? (
                <span className="text-[11px] text-muted-foreground">
                  Add areas to group projects.
                </span>
              ) : null}
              {areas.map((area) => (
                <ProjectAreaChip
                  key={area.id}
                  area={area}
                  disabled={isBusy}
                  onColorChange={changeColor}
                  onRemove={removeArea}
                />
              ))}
            </div>

            <form
              className="flex w-full items-center gap-1.5 sm:ml-auto sm:w-auto"
              onSubmit={(event) => {
                event.preventDefault();
                addArea();
              }}
            >
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="New area…"
                disabled={isBusy}
                className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-[12px] ring-focus placeholder:text-muted-foreground sm:w-36 sm:flex-none"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!draftTitle.trim() || isBusy}
                className="h-7 gap-1 px-2 text-[11px]"
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </form>
          </>
        )}
      </div>

      {error ? (
        <p className="mt-2 text-[11px] text-destructive">{error}</p>
      ) : null}
    </section>
  );
}
