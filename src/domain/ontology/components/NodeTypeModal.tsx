import { useState, useEffect, useMemo } from "react";
import { Check, Pencil, Trash2, Plus } from "lucide-react";
import { HslColorPicker } from "react-colorful";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOntologyFlowContext } from "../context/OntologyFlowContext";
import type { NodeType, FieldSchemaEntry } from "../utils/types";
import { useCreateNodeTypeMutation } from "../hooks/useCreateNodeTypeMutation";
import { useUpdateNodeTypeMutation } from "../hooks/useUpdateNodeTypeMutation";
import { useDeleteNodeTypeMutation } from "../hooks/useDeleteNodeTypeMutation";
import { useNodeTypesQuery } from "../hooks/queries";

/** Emoji options for field icons (shown in node type field form and on nodes). */
const FIELD_ICON_OPTIONS = [
  "📅", "📌", "👤", "✏️", "📎", "🔗", "📍", "🏷️", "⭐", "📊",
  "📁", "📄", "💡", "🎯", "✅", "📝", "🔔", "📧", "📞", "🌐",
  "💰", "⏰", "📈", "🔒", "📂", "🏠", "📋", "🖼️", "📦", " ",
];

/** Parse "H S% L%" or "hsl(H, S%, L%)" to { h, s, l } (0-360, 0-100, 0-100). */
function parseHslString(str: string): { h: number; s: number; l: number } | null {
  if (!str || typeof str !== "string") return null;
  const raw = str.replace(/^hsl\(|\)$/gi, "").trim();
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)%?\s*[,\s]\s*(\d+(?:\.\d+)?)%?$/);
  if (!match) return null;
  const h = Math.min(360, Math.max(0, Number(match[1])));
  const s = Math.min(100, Math.max(0, Number(match[2])));
  const l = Math.min(100, Math.max(0, Number(match[3])));
  return { h, s, l };
}

/** Format { h, s, l } as "H S% L%" for storage. */
function hslToString(hsl: { h: number; s: number; l: number }): string {
  return `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%`;
}

const DEFAULT_HSL = { h: 220, s: 85, l: 55 };

const presetColors = [
  { name: "Teal", hsl: "174 35% 35%" },
  { name: "Coral", hsl: "12 76% 61%" },
  { name: "Purple", hsl: "270 50% 50%" },
  { name: "Rose", hsl: "350 65% 55%" },
  { name: "Amber", hsl: "38 92% 50%" },
  { name: "Emerald", hsl: "160 84% 39%" },
  { name: "Sky", hsl: "199 89% 48%" },
  { name: "Violet", hsl: "258 90% 66%" },
  { name: "Lime", hsl: "84 85% 43%" },
  { name: "Fuchsia", hsl: "292 84% 61%" },
];

interface NodeTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeTypeModal({ open, onOpenChange }: NodeTypeModalProps) {
  const { nodeTypes } = useOntologyFlowContext();
  const { data: nodeTypesList = [] } = useNodeTypesQuery();
  const createMutation = useCreateNodeTypeMutation();
  const updateMutation = useUpdateNodeTypeMutation();
  const deleteMutation = useDeleteNodeTypeMutation();

  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingType, setEditingType] = useState<NodeType | null>(null);

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(presetColors[0].hsl);
  const [allowedParents, setAllowedParents] = useState<(string | "custom" | null)[]>([]);
  const [allowedChildren, setAllowedChildren] = useState<(string | "custom")[]>([]);
  const [hasLifecycle, setHasLifecycle] = useState(false);
  const [fieldSchema, setFieldSchema] = useState<FieldSchemaEntry[]>([]);

  useEffect(() => {
    if (open && mode === "list") {
      setEditingType(null);
      setMode("list");
    }
  }, [open, mode]);

  const openCreate = () => {
    setEditingType(null);
    setName("");
    setSelectedColor(presetColors[0].hsl);
    setAllowedParents([null]);
    setAllowedChildren([]);
    setHasLifecycle(false);
    setFieldSchema([]);
    setMode("form");
  };

  const openEdit = (nt: NodeType) => {
    setEditingType(nt);
    setName(nt.label);
    const parsed = parseHslString(nt.color ?? presetColors[0].hsl);
    setSelectedColor(parsed ? hslToString(parsed) : presetColors[0].hsl);
    setAllowedParents(nt.allowedParents ?? [null]);
    setAllowedChildren(nt.allowedChildren ?? []);
    setHasLifecycle((nt.lifecycleStates?.length ?? 0) > 0);
    setFieldSchema(nt.fieldSchema ?? []);
    setMode("form");
  };

  const hslObject = useMemo(
    () => parseHslString(selectedColor) ?? DEFAULT_HSL,
    [selectedColor]
  );

  const typeIds = Object.keys(nodeTypes);
  const toggleParent = (t: string | "custom" | null) => {
    setAllowedParents((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };
  const toggleChild = (t: string | "custom") => {
    setAllowedChildren((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const addField = () => {
    setFieldSchema((prev) => [...prev, { key: "", label: "", type: "text" }]);
  };
  const updateField = (index: number, patch: Partial<FieldSchemaEntry>) => {
    setFieldSchema((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      if (patch.key !== undefined) next[index].key = (patch.key || "").trim().replace(/\s+/g, "_") || next[index].key;
      return next;
    });
  };
  const removeField = (index: number) => {
    setFieldSchema((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const parentsPayload = allowedParents.map((p) => (p === "custom" ? "custom" : p));
    const childrenPayload = allowedChildren;
    const lifecyclePayload = hasLifecycle ? (["planned", "active", "complete"] as (string | null)[]) : [];
    const schemaPayload = fieldSchema.filter((f) => f.key.trim() && f.label.trim()).map((f) => ({
      key: f.key.trim().replace(/\s+/g, "_"),
      label: f.label.trim(),
      type: f.type || "text",
      ...(f.icon?.trim() ? { icon: f.icon.trim() } : {}),
    }));

    if (editingType) {
      updateMutation.mutate(
        {
          id: editingType.id,
          data: {
            label: name.trim(),
            color: selectedColor,
            allowedParents: parentsPayload,
            allowedChildren: childrenPayload,
            lifecycleStates: lifecyclePayload,
            fieldSchema: schemaPayload,
          },
        },
        {
          onSuccess: () => {
            setMode("list");
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          label: name.trim(),
          color: selectedColor,
          allowedParents: parentsPayload,
          allowedChildren: childrenPayload,
          lifecycleStates: lifecyclePayload,
          fieldSchema: schemaPayload,
        },
        {
          onSuccess: () => {
            setMode("list");
            onOpenChange(false);
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this type? Nodes using it will need to be updated first.")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => setMode("list"),
    });
  };

  if (mode === "form") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingType ? "Edit Node Type" : "Create Node Type"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Type Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Research, Reference..."
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.hsl)}
                    className="relative h-10 rounded-md transition-all hover:scale-105 border-2 border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{ backgroundColor: `hsl(${color.hsl})` }}
                    title={color.name}
                  >
                    {selectedColor === color.hsl && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-3 mt-3">
                <div className="shrink-0 rounded-lg overflow-hidden border border-border bg-card">
                  <HslColorPicker
                    color={hslObject}
                    onChange={(hsl) => setSelectedColor(hslToString(hsl))}
                    style={{ width: 200, height: 160 }}
                    className="!rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div
                    className="w-full h-10 rounded-md border border-border shrink-0"
                    style={{ backgroundColor: `hsl(${selectedColor})` }}
                    aria-hidden
                  />
                  <Input
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    placeholder="H S% L%"
                    className="bg-background border-border text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Can be child of</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleParent(null)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    allowedParents.includes(null) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Root
                </button>
                {typeIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleParent(id)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      allowedParents.includes(id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {nodeTypes[id]?.label ?? id}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => toggleParent("custom")}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    allowedParents.includes("custom") ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Can contain</Label>
              <div className="flex flex-wrap gap-2">
                {typeIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleChild(id)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      allowedChildren.includes(id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {nodeTypes[id]?.label ?? id}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => toggleChild("custom")}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    allowedChildren.includes("custom") ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Fields (per instance)</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addField} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              {fieldSchema.length === 0 ? (
                <p className="text-xs text-muted-foreground">No fields. Add keys like owner, author, publish_date.</p>
              ) : (
                <div className="space-y-2">
                  {fieldSchema.map((f, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 border-border bg-background text-base"
                            title="Choose icon for this field"
                          >
                            {f.icon?.trim() || "⋯"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-auto p-2">
                          <div className="grid grid-cols-6 gap-0.5">
                            {FIELD_ICON_OPTIONS.map((emoji) => (
                              <Button
                                key={emoji === " " ? "none" : emoji}
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-lg hover:bg-muted"
                                onClick={() => updateField(i, { icon: emoji === " " ? undefined : emoji })}
                                title={emoji === " " ? "Clear icon" : undefined}
                              >
                                {emoji === " " ? "✕" : emoji}
                              </Button>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Input
                        placeholder="key"
                        value={f.key}
                        onChange={(e) => updateField(i, { key: e.target.value })}
                        className="flex-1 bg-background border-border text-sm min-w-0"
                      />
                      <Input
                        placeholder="label"
                        value={f.label}
                        onChange={(e) => updateField(i, { label: e.target.value })}
                        className="flex-1 bg-background border-border text-sm min-w-0"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => updateField(i, { type: e.target.value })}
                        className="h-9 rounded-md border border-border bg-background text-sm px-2 shrink-0"
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="date">date</option>
                      </select>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeField(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="lifecycle"
                checked={hasLifecycle}
                onChange={(e) => setHasLifecycle(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="lifecycle" className="text-sm text-foreground cursor-pointer">
                Lifecycle (Planned → Active → Complete)
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setMode("list")}>
              Back
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {editingType ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const list = [...nodeTypesList].sort((a, b) => (a.isPreset === b.isPreset ? 0 : a.isPreset ? -1 : 1));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Node Types</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Button onClick={openCreate} className="w-full gap-2 mb-4">
            <Plus className="h-4 w-4" /> Create type
          </Button>
          <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
            {list.map((nt) => (
              <li
                key={nt.id}
                className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/40 border border-border/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: nt.color?.startsWith("hsl(") ? nt.color : `hsl(${nt.color})` }}
                  />
                  <span className="font-medium text-foreground truncate">{nt.label}</span>
                  {nt.isPreset && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">Preset</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(nt)}
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {!nt.isPreset && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(nt.id)}
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
