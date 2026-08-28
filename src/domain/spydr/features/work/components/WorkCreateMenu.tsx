import { CheckSquare, FolderKanban, Plus, UserPlus } from "lucide-react";
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
  onCreatePerson(): void;
}

export function WorkCreateMenu({
  onCreateProject,
  onCreateTask,
  onCreatePerson,
}: WorkCreateMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 px-3 text-[12px]">
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
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onCreatePerson}>
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
          Person
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
