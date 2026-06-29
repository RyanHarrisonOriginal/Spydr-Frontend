import { FolderKanban } from "lucide-react";
import type { ProjectNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";
import { ProjectListFieldSelect } from "./ProjectListFieldSelect";

interface ProjectSelectProps {
  projects: ProjectNode[];
  value: string;
  onChange(projectId: string | null): void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  allowUnassigned?: boolean;
  compact?: boolean;
}

export function ProjectSelect({
  projects,
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "Select project…",
  allowUnassigned = false,
  compact = false,
}: ProjectSelectProps) {
  const options = [
    ...(allowUnassigned ? [{ value: "", label: "No project" }] : []),
    ...projects.map((project) => ({
      value: project.id,
      label: project.title,
    })),
  ];

  return (
    <ProjectListFieldSelect
      value={value}
      options={options}
      onChange={(next) => onChange(next ? next : null)}
      disabled={disabled || (!allowUnassigned && projects.length === 0)}
      ariaLabel="Project"
      menuLabel="Project"
      placeholder={allowUnassigned ? "No project" : placeholder}
      emptyValue=""
      leading={
        compact ? undefined : (
          <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )
      }
      triggerClassName={cn(compact && "h-7 border-border/70 px-2 text-[11px]", className)}
      labelClassName={cn(
        "font-medium tracking-tight text-foreground/90",
        compact && "text-[11px]"
      )}
    />
  );
}
