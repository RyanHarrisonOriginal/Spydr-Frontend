import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateSpawnedProject } from "@/domain/spydr/utils/types";
import { UNSPECIFIED_PARAM_VALUE } from "../utils/templateParameters";

export interface SpawnedParameterSpec {
  key: string;
  label: string;
}

interface SpawnedParameterValuesDialogProps {
  open: boolean;
  projects: TemplateSpawnedProject[];
  parameters: SpawnedParameterSpec[];
  values: Record<string, Record<string, string>>;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onValuesChange(values: Record<string, Record<string, string>>): void;
  onOpenChange(open: boolean): void;
  onConfirm(): void;
}

export function SpawnedParameterValuesDialog({
  open,
  projects,
  parameters,
  values,
  isSubmitting,
  errorMessage,
  onValuesChange,
  onOpenChange,
  onConfirm,
}: SpawnedParameterValuesDialogProps) {
  const paramSummary = parameters.map((param) => param.key).join(", ");

  const setValue = (projectId: string, key: string, value: string) => {
    onValuesChange({
      ...values,
      [projectId]: {
        ...(values[projectId] ?? {}),
        [key]: value,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Set values for connected projects</DialogTitle>
          <DialogDescription>
            {parameters.length === 1
              ? `This template introduces ${parameters[0].key}. Set a value for each connected project, or keep ${UNSPECIFIED_PARAM_VALUE}.`
              : `This template introduces ${paramSummary}. Set a value for each connected project, or keep ${UNSPECIFIED_PARAM_VALUE}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto py-2">
          {projects.map((project) => (
            <section
              key={project.id}
              className="space-y-3 rounded-md border border-border/60 p-3"
            >
              <h3 className="text-sm font-medium">{project.title}</h3>
              {parameters.map((param) => (
                <div key={param.key} className="space-y-1.5">
                  <Label htmlFor={`${project.id}-${param.key}`}>
                    {param.label}
                    <span className="ml-1 font-mono text-[11px] text-muted-foreground">
                      {param.key}
                    </span>
                  </Label>
                  <Input
                    id={`${project.id}-${param.key}`}
                    value={
                      values[project.id]?.[param.key] ?? UNSPECIFIED_PARAM_VALUE
                    }
                    onChange={(event) =>
                      setValue(project.id, param.key, event.target.value)
                    }
                  />
                </div>
              ))}
            </section>
          ))}
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || projects.length === 0}
            onClick={onConfirm}
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
