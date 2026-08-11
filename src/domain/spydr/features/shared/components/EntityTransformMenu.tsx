import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, CheckSquare, FolderKanban, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import {
  transformResultHref,
  useTransformNodeTypeMutation,
} from "@/domain/spydr/features/shared/hooks/useTransformNodeTypeMutation";
import type {
  ProjectNode,
  TransformableNodeType,
  TransformTargetType,
} from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";

interface EntityTransformMenuProps {
  nodeId: string;
  sourceType: TransformableNodeType;
  sourceTitle: string;
  projects?: ProjectNode[];
  defaultProjectId?: string | null;
  excludeProjectId?: string;
  compact?: boolean;
  className?: string;
}

type PendingTransform = {
  targetType: TransformTargetType;
  needsProjectPicker: boolean;
};

function targetLabel(targetType: TransformTargetType) {
  if (targetType === "project") return "Project";
  if (targetType === "note") return "Note";
  return "Task";
}

function needsTargetProject(targetType: TransformTargetType) {
  return targetType === "task" || targetType === "note";
}

export function EntityTransformMenu({
  nodeId,
  sourceType,
  sourceTitle,
  projects = [],
  defaultProjectId = null,
  excludeProjectId,
  compact = false,
  className,
}: EntityTransformMenuProps) {
  const navigate = useNavigate();
  const transform = useTransformNodeTypeMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState<PendingTransform | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const availableProjects = projects.filter((project) => project.id !== excludeProjectId);

  const options: PendingTransform[] = (() => {
    if (sourceType === "project") {
      return [
        { targetType: "task", needsProjectPicker: true },
        { targetType: "note", needsProjectPicker: true },
      ];
    }
    if (sourceType === "task") {
      return [{ targetType: "project", needsProjectPicker: false }];
    }
    return [
      { targetType: "task", needsProjectPicker: !defaultProjectId },
      { targetType: "project", needsProjectPicker: false },
    ];
  })();

  const beginTransform = (option: PendingTransform) => {
    setError(null);
    setPending(option);
    setSelectedProjectId(defaultProjectId ?? availableProjects[0]?.id ?? "");

    if (option.needsProjectPicker) {
      setDialogOpen(true);
      return;
    }

    void submitTransform(option, defaultProjectId);
  };

  const submitTransform = async (
    option: PendingTransform,
    projectId: string | null | undefined
  ) => {
    setError(null);
    try {
      const result = await transform.mutateAsync({
        nodeId,
        targetType: option.targetType,
        projectId: needsTargetProject(option.targetType) ? projectId : undefined,
      });
      setDialogOpen(false);
      setPending(null);
      navigate(transformResultHref(result));
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to transform entity"
      );
    }
  };

  const handleConfirm = () => {
    if (!pending) return;
    if (pending && needsTargetProject(pending.targetType) && !selectedProjectId) {
      setError(`Choose a project for the ${targetLabel(pending.targetType).toLowerCase()}`);
      return;
    }
    void submitTransform(
      pending,
      pending && needsTargetProject(pending.targetType) ? selectedProjectId : undefined
    );
  };

  if (options.length === 0) return null;

  const triggerLabel = compact ? "Transform" : "Transform to…";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            className={cn(
              compact
                ? "h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                : "gap-1.5",
              className
            )}
            disabled={transform.isPending}
          >
            <ArrowRightLeft className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
            {triggerLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
            Transform “{sourceTitle.trim() || "Untitled"}”
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.targetType}
              onClick={() => beginTransform(option)}
              className="gap-2 text-[13px]"
            >
              {option.targetType === "project" ? (
                <FolderKanban className="h-3.5 w-3.5 text-highlight" />
              ) : option.targetType === "note" ? (
                <StickyNote className="h-3.5 w-3.5 text-highlight" />
              ) : (
                <CheckSquare className="h-3.5 w-3.5 text-highlight" />
              )}
              <span>Into {targetLabel(option.targetType).toLowerCase()}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="h-4 w-4 text-highlight" />
              Transform into {pending ? targetLabel(pending.targetType).toLowerCase() : "entity"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {pending && needsTargetProject(pending.targetType) ? (
              <div className="space-y-2">
                <p className="text-[12px] text-muted-foreground">
                  This item keeps the same identity but becomes a{" "}
                  {targetLabel(pending.targetType).toLowerCase()} under the selected project.
                </p>
                <ProjectSelect
                  projects={availableProjects}
                  value={selectedProjectId}
                  onChange={(projectId) => setSelectedProjectId(projectId ?? "")}
                  className="w-full"
                />
              </div>
            ) : null}

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={transform.isPending}>
              {transform.isPending ? "Transforming…" : "Transform"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
