import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useOntologyApi } from "@/domain/ontology/hooks/useOntologyApi";
import {
  OntologyListHeader,
  OntologyCard,
  OntologyEmptyState,
} from "@/domain/ontology/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthControls } from "@/components/AuthControls";
import { Plus, Sparkles } from "lucide-react";
import type { OntologyCardItem } from "@/domain/ontology/components";
import type { NodeType } from "@/domain/ontology/utils/types";

function toCssColor(color: string): string {
  return color.startsWith("#") ? color : `hsl(${color})`;
}

export default function OntologyDashboardScreen() {
  const navigate = useNavigate();
  const { queries, mutations } = useOntologyApi();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const ontologiesData = queries.ontologies.data ?? [];
  const nodeTypesList = queries.nodeTypes.data ?? [];

  const cardItems = useMemo<OntologyCardItem[]>(
    () =>
      ontologiesData.map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description,
        updatedAt: o.updatedAt,
        nodeCount: o.nodeCount,
        typeDistribution: o.typeDistribution,
      })),
    [ontologiesData]
  );

  const typeMap = useMemo(() => {
    const m = new Map<string, NodeType>();
    for (const t of nodeTypesList) m.set(t.id, t);
    return m;
  }, [nodeTypesList]);

  const getTypeColor = useCallback(
    (typeId: string) => {
      const t = typeMap.get(typeId);
      return t ? toCssColor(t.color) : "hsl(var(--muted-foreground))";
    },
    [typeMap]
  );

  const handleOpen = (item: OntologyCardItem) => {
    navigate(`/ontology/${item.id}`);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    mutations.createOntology.mutate(
      { name: newName.trim(), description: newDescription.trim() },
      {
        onSuccess: () => {
          setNewName("");
          setNewDescription("");
          setIsCreateOpen(false);
        },
      }
    );
  };

  const handleEdit = (item: OntologyCardItem) => {
    setEditingId(item.id);
    setNewName(item.name);
    setNewDescription(item.description);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingId || !newName.trim()) return;
    mutations.updateOntology.mutate(
      { id: editingId, data: { name: newName.trim(), description: newDescription.trim() } },
      {
        onSuccess: () => {
          setEditingId(null);
          setNewName("");
          setNewDescription("");
          setIsEditOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    mutations.deleteOntology.mutate(id);
  };

  const totalNodes = cardItems.reduce((s, o) => s + (o.nodeCount ?? 0), 0);
  const firstOntologyId = cardItems[0]?.id;

  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    if (!typeFilter) return cardItems;
    return cardItems.filter(
      (item) => (item.typeDistribution?.[typeFilter] ?? 0) > 0
    );
  }, [cardItems, typeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <OntologyListHeader
        left={<Logo size="sm" />}
        right={
          <div className="flex items-center gap-2">
            <AuthControls />
            <ThemeToggle />
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Ontology</DialogTitle>
                  <DialogDescription>
                    Name your thinking space; add a short description if it helps.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., Product strategy · Life ideas"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Optional—what is this map for?"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!newName.trim()}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-8 md:px-16 py-16">
          <section className="animate-reveal">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                Ontologies
              </h2>
              <span className="text-xs text-muted-foreground/50 tabular-nums">
                {cardItems.length === 0
                  ? "None yet"
                  : typeFilter
                    ? `Showing ${filteredCards.length} of ${cardItems.length}`
                    : `${cardItems.length} ${cardItems.length === 1 ? "ontology" : "ontologies"} · ${totalNodes} ${totalNodes === 1 ? "node" : "nodes"}`}
              </span>
            </div>

            {/* Legend + filter: node types with a clear purpose */}
            {nodeTypesList.length > 0 && cardItems.length > 0 && (
              <div className="mb-6 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground/80 mb-3">
                  Filter by node type. Colors match the composition bars on each card.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTypeFilter(null)}
                    className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      typeFilter === null
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border/50 bg-background/80 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    All
                  </button>
                  {nodeTypesList.map((t) => {
                    const isActive = typeFilter === t.id;
                    const count = cardItems.filter(
                      (o) => (o.typeDistribution?.[t.id] ?? 0) > 0
                    ).length;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTypeFilter(isActive ? null : t.id)}
                        className={`inline-flex items-center gap-2 rounded-md border border-border/50 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "bg-background/80 text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                        style={{
                          borderLeftWidth: "3px",
                          borderLeftColor: toCssColor(t.color),
                        }}
                        title={`${count} ${count === 1 ? "ontology" : "ontologies"} contain ${t.label}`}
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: toCssColor(t.color) }}
                        />
                        <span>{t.label}</span>
                        <span className="text-muted-foreground/60 tabular-nums">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                  {firstOntologyId && (
                    <button
                      type="button"
                      onClick={() => navigate(`/ontology/${firstOntologyId}`)}
                      className="ml-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Manage types
                    </button>
                  )}
                </div>
              </div>
            )}

            {cardItems.length === 0 ? (
              <OntologyEmptyState onCreate={() => setIsCreateOpen(true)} />
            ) : (
              <>
                {typeFilter && filteredCards.length === 0 ? (
                  <div className="rounded-lg border border-border/40 bg-muted/10 px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      No ontologies contain this node type.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTypeFilter(null)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Clear filter
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredCards.map((item, index) => (
                      <OntologyCard
                        key={item.id}
                        ontology={item}
                        onOpen={handleOpen}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        updatedLabel={`Updated ${formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}`}
                        getTypeColor={getTypeColor}
                        animationDelay={index * 60}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ontology</DialogTitle>
            <DialogDescription>Update the name and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., Product strategy · Life ideas"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional—what is this map for?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!newName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
