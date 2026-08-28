import { CheckSquare, ChevronDown, FolderKanban, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { WorkViewMode } from "../hooks/useWorkScope";

interface WorkCreateMenuProps {
  view: WorkViewMode;
  onCreateProject(): void;
  onCreateTask(): void;
  onCreatePerson(): void;
}

export function WorkCreateMenu({
  view,
  onCreateProject,
  onCreateTask,
  onCreatePerson,
}: WorkCreateMenuProps) {
  const primaryIsTask = view === "tasks";

  return (
    <div className="inline-flex h-8 overflow-hidden rounded-sm border border-primary/30 shadow-sm">
      <Button
        type="button"
        size="sm"
        className="h-8 rounded-none px-3 text-[12px] shadow-none"
        onClick={primaryIsTask ? onCreateTask : onCreateProject}
      >
        <Plus className="h-3.5 w-3.5" />
        {primaryIsTask ? "New task" : "New project"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            aria-label="More create options"
            className={cn(
              "h-8 w-8 rounded-none border-l border-primary-foreground/20 px-0 shadow-none"
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onCreateProject}>
            <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
            Project
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onCreateTask}>
            <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
            Task
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onCreatePerson}>
            <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
            Person
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
