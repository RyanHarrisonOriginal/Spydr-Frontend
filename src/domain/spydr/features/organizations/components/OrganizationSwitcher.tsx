import { Building2, Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useOrganizationContext } from "../context/OrganizationContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/domain/spydr/features/shell/shell-chrome.css";

export function OrganizationSwitcher() {
  const navigate = useNavigate();
  const {
    organizations,
    activeOrg,
    activeOrgId,
    setActiveOrgId,
    createOrganization,
    isCreating,
    isLoading,
  } = useOrganizationContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await createOrganization(name.trim());
      setName("");
      setCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    }
  }

  if (isLoading) {
    return (
      <div className="shell-spaces-trigger h-[30px] min-w-[9rem] animate-pulse" />
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="shell-spaces-trigger max-w-[9.5rem] justify-between gap-2 px-2.5 text-[13px] font-medium text-[var(--fg)] md:max-w-[14rem]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" strokeWidth={1.75} />
              <span className="truncate">{activeOrg?.name ?? "Select organization"}</span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-[11.5px] font-medium text-[var(--muted-2)]">
            Organizations
          </DropdownMenuLabel>
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              className="gap-2"
              onClick={() => setActiveOrgId(org.id)}
            >
              <Check
                className={cn(
                  "h-3.5 w-3.5",
                  org.id === activeOrgId ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">{org.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create organization
          </DropdownMenuItem>
          {activeOrg ? (
            <DropdownMenuItem className="gap-2" onClick={() => navigate("/settings")}>
              <Settings className="h-3.5 w-3.5" />
              Organization settings
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create organization</DialogTitle>
              <DialogDescription>
                Separate workspaces for different contexts — day job, consulting, personal
                projects, and more.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Name</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Consulting"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!name.trim() || isCreating}>
                {isCreating ? "Creating…" : "Create organization"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
