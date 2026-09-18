import { FolderKanban } from "lucide-react";
import type { ProjectNode } from "@/domain/spydr/utils/types";
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
  fitContent?: boolean;
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
  fitContent = false,
}: ProjectSelectProps) {
  const options = [
    ...(allowUnassigned ? [{ value: "", label: "No project" }] : []),
    ...projects.map((project) => ({
      value: project.id,
      label: project.details?.emoji
        ? `${project.details.emoji} ${project.title}`
        : project.title,
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
      searchable
      fitContent={fitContent}
      leading={
        compact ? undefined : (
          <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )
      }
      triggerClassName={className}
      labelClassName="font-medium tracking-tight text-foreground/90"
    />
  );
}
