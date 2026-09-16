import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import { nextAreaPresetColor } from "@/domain/spydr/utils/projectAreaColors";
import { useCreateProjectAreaMutation } from "../hooks/useCreateProjectAreaMutation";
import { useDeleteProjectAreaMutation } from "../hooks/useDeleteProjectAreaMutation";
import { useUpdateProjectAreaMutation } from "../hooks/useUpdateProjectAreaMutation";
import { ProjectAreaChip } from "./ProjectAreaChip";

interface ProjectAreasPanelProps {
  areas: ProjectAreaNode[];
  isLoading?: boolean;
}

export function ProjectAreasPanel({ areas, isLoading = false }: ProjectAreasPanelProps) {
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
        onSuccess: () => setDraftTitle(""),
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

  const renameArea = async (area: ProjectAreaNode, title: string) => {
    setError(null);
    await updateArea.mutateAsync(
      { areaId: area.id, input: { title } },
      {
        onError: (mutationError) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : "Failed to rename project area"
          );
        },
      }
    );
  };

  return (
    <section className="space-y-3 border-b border-border/60 px-4 py-4 md:px-8">
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Project areas
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Group projects by area. Click an area name to rename it. Colors show up on Work and project lists.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {isLoading ? (
          <span className="text-[12px] text-muted-foreground">Loading…</span>
        ) : null}
        {!isLoading && areas.length === 0 ? (
          <span className="text-[12px] text-muted-foreground">
            No areas yet. Add one to start grouping projects.
          </span>
        ) : null}
        {areas.map((area) => (
          <ProjectAreaChip
            key={area.id}
            area={area}
            disabled={isBusy}
            onColorChange={changeColor}
            onTitleChange={renameArea}
            onRemove={removeArea}
          />
        ))}
      </div>

      <form
        className="flex max-w-md items-center gap-2"
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
          className="spydr-input min-w-0 flex-1"
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!draftTitle.trim() || isBusy}
          className="h-10 gap-1 px-3 text-[13px]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
