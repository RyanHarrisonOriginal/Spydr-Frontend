import { CheckSquare, FolderKanban, LayoutTemplate, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkCreateMenuProps {
  onCreateProject(): void;
  onCreateTask(): void;
  onCreateTemplate(): void;
  onCreatePerson(): void;
}

export function WorkCreateMenu({
  onCreateProject,
  onCreateTask,
  onCreateTemplate,
  onCreatePerson,
}: WorkCreateMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="work-page-new h-[30px] gap-1.5 rounded-lg border-0 bg-[var(--fg)] px-3 text-[12px] font-semibold text-[var(--canvas)] shadow-none hover:bg-[var(--fg)] hover:text-[var(--canvas)] hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          New
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
        <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onCreateTemplate}>
          <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
          Template
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onCreatePerson}>
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
          Person
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
