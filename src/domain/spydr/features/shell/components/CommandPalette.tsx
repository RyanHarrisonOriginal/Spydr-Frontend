import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  ClipboardList,
  FileText,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Link2,
  NotebookPen,
  Plus,
  UserRound,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  useDecisionsQuery,
  useIdeasQuery,
  useNotesQuery,
  usePeopleQuery,
  useProjectsQuery,
  useResourcesQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";

const RESULT_LIMIT = 8;

type CommandPaletteContextValue = {
  open: () => void;
  close: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: () => undefined,
  close: () => undefined,
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const projectsQuery = useProjectsQuery();
  const tasksQuery = useTasksQuery();
  const peopleQuery = usePeopleQuery();
  const notesQuery = useNotesQuery();
  const decisionsQuery = useDecisionsQuery();
  const ideasQuery = useIdeasQuery();
  const resourcesQuery = useResourcesQuery();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    []
  );

  const go = (to: string) => {
    navigate(to);
    setIsOpen(false);
  };

  const projects = projectsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const people = peopleQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const decisions = decisionsQuery.data ?? [];
  const ideas = ideasQuery.data ?? [];
  const resources = resourcesQuery.data ?? [];

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Search projects, tasks, people, notes…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Create">
            <CommandItem
              value="create active note capture"
              onSelect={() => go("/active-note")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New active note
            </CommandItem>
            <CommandItem value="create task" onSelect={() => go("/tasks")}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Tasks
            </CommandItem>
            <CommandItem value="create project" onSelect={() => go("/projects")}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Jump to">
            <CommandItem
              value="jump active note home"
              onSelect={() => go("/active-note")}
            >
              <NotebookPen className="mr-2 h-4 w-4" />
              Active Note
            </CommandItem>
            <CommandItem value="jump dashboard" onSelect={() => go("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem value="jump projects" onSelect={() => go("/projects")}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </CommandItem>
            <CommandItem value="jump tasks" onSelect={() => go("/tasks")}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Tasks
            </CommandItem>
            <CommandItem value="jump notes" onSelect={() => go("/notes")}>
              <FileText className="mr-2 h-4 w-4" />
              Notes
            </CommandItem>
            <CommandItem value="jump people" onSelect={() => go("/people")}>
              <UserRound className="mr-2 h-4 w-4" />
              People
            </CommandItem>
            <CommandItem
              value="jump decisions"
              onSelect={() => go("/decisions")}
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Decisions
            </CommandItem>
            <CommandItem value="jump ideas" onSelect={() => go("/ideas")}>
              <Lightbulb className="mr-2 h-4 w-4" />
              Ideas
            </CommandItem>
            <CommandItem
              value="jump resources"
              onSelect={() => go("/resources")}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Resources
            </CommandItem>
          </CommandGroup>

          {projects.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projects">
                {projects.slice(0, RESULT_LIMIT).map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project ${project.title}`}
                    onSelect={() => go(`/projects/${project.id}`)}
                  >
                    <FolderKanban className="mr-2 h-4 w-4 opacity-60" />
                    <span className="truncate">{project.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}

          {tasks.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tasks">
                {tasks.slice(0, RESULT_LIMIT).map((task) => (
                  <CommandItem
                    key={task.id}
                    value={`task ${task.title} ${task.project?.title ?? ""}`}
                    onSelect={() => go(`/tasks/${task.id}`)}
                  >
                    <ClipboardList className="mr-2 h-4 w-4 opacity-60" />
                    <span className="min-w-0 flex-1 truncate">{task.title}</span>
                    {task.project?.title ? (
                      <span className="ml-2 truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {task.project.title}
                      </span>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}

          {people.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="People">
                {people.slice(0, RESULT_LIMIT).map((person) => {
                  const name = personDisplayName(person);
                  return (
                    <CommandItem
                      key={person.id}
                      value={`person ${name} ${person.details?.email ?? ""} ${person.details?.title ?? ""}`}
                      onSelect={() => go(`/people/${person.id}`)}
                    >
                      <UserRound className="mr-2 h-4 w-4 opacity-60" />
                      <span className="truncate">{name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          ) : null}

          {notes.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Notes">
                {notes.slice(0, RESULT_LIMIT).map((note) => (
                  <CommandItem
                    key={note.id}
                    value={`note ${note.title}`}
                    onSelect={() => go(`/notes/${note.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4 opacity-60" />
                    <span className="truncate">{note.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}

          {decisions.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Decisions">
                {decisions.slice(0, RESULT_LIMIT).map((decision) => (
                  <CommandItem
                    key={decision.id}
                    value={`decision ${decision.title}`}
                    onSelect={() =>
                      go(
                        decision.project?.id
                          ? `/projects/${decision.project.id}`
                          : "/decisions"
                      )
                    }
                  >
                    <GitBranch className="mr-2 h-4 w-4 opacity-60" />
                    <span className="truncate">{decision.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}

          {ideas.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Ideas">
                {ideas.slice(0, RESULT_LIMIT).map((idea) => (
                  <CommandItem
                    key={idea.id}
                    value={`idea ${idea.title}`}
                    onSelect={() => go("/ideas")}
                  >
                    <Lightbulb className="mr-2 h-4 w-4 opacity-60" />
                    <span className="truncate">{idea.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}

          {resources.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Resources">
                {resources.slice(0, RESULT_LIMIT).map((resource) => {
                  const url = resource.details?.url ?? null;
                  return (
                    <CommandItem
                      key={resource.id}
                      value={`resource ${resource.title} ${url ?? ""}`}
                      onSelect={() => {
                        if (url) {
                          window.open(url, "_blank", "noopener,noreferrer");
                          setIsOpen(false);
                          return;
                        }
                        go("/resources");
                      }}
                    >
                      <Link2 className="mr-2 h-4 w-4 opacity-60" />
                      <span className="truncate">{resource.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}
