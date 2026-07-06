import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useOrganizationContext } from "../context/OrganizationContext";

export function OrganizationOnboarding() {
  const { createOrganization, isCreating } = useOrganizationContext();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await createOrganization(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card/60 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/12 text-highlight ring-1 ring-highlight/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Create your first organization</h1>
            <p className="text-sm text-muted-foreground">
              Organizations keep projects, people, and tasks separate.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="first-org-name">Organization name</Label>
            <Input
              id="first-org-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Day job, Consulting, Personal…"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full gap-1.5" disabled={!name.trim() || isCreating}>
            <Plus className="h-3.5 w-3.5" />
            {isCreating ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </div>
    </div>
  );
}
