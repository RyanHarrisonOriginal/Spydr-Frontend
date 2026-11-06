import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, CheckSquare, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import {
  transformResultHref,
  useTransformNodeTypeMutation,
} from "@/domain/spydr/features/shared/hooks/useTransformNodeTypeMutation";
import type { ProjectNode, TransformTargetType } from "@/domain/spydr/utils/types";

interface LogPromoteDialogProps {
  open: boolean;
  nodeId: string | null;
  sourceTitle: string;
  projects: ProjectNode[];
  defaultProjectId?: string | null;
  onOpenChange: (open: boolean) => void;
}

export function LogPromoteDialog({
  open,
  nodeId,
  sourceTitle,
  projects,
  defaultProjectId = null,
  onOpenChange,
}: LogPromoteDialogProps) {
  const navigate = useNavigate();
  const transform = useTransformNodeTypeMutation();
  const [target, setTarget] = useState<TransformTargetType>("task");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [error, setError] = useState<string | null>(null);

  const needsProject = target === "task" || target === "note";

  const submit = async () => {
    if (!nodeId) return;
    if (needsProject && !projectId) {
      setError("Choose a project");
      return;
    }
    setError(null);
    try {
      const result = await transform.mutateAsync({
        nodeId,
        targetType: target,
        projectId: needsProject ? projectId : undefined,
      });
      onOpenChange(false);
      navigate(transformResultHref(result));
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to promote"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setTarget("task");
          setProjectId(defaultProjectId ?? projects[0]?.id ?? "");
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ArrowUpRight className="h-4 w-4" />
            Promote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <p className="text-[12px] text-muted-foreground">
            Promote “{sourceTitle.trim() || "idea"}” into a task or project.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={target === "task" ? "default" : "outline"}
              className="gap-1.5"
              onClick={() => setTarget("task")}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Task
            </Button>
            <Button
              type="button"
              size="sm"
              variant={target === "project" ? "default" : "outline"}
              className="gap-1.5"
              onClick={() => setTarget("project")}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              Project
            </Button>
          </div>
          {needsProject ? (
            <ProjectSelect
              projects={projects}
              value={projectId}
              onChange={(id) => setProjectId(id ?? "")}
              className="w-full"
            />
          ) : null}
          {error ? (
            <p className="text-[12px] text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={transform.isPending || !nodeId}
          >
            {transform.isPending ? "Promoting…" : "Promote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
