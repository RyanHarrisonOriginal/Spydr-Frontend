import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  humanizeParameterKey,
  isValidParameterKey,
  normalizeParameterKey,
  type TemplateParameterOption,
} from "../utils/templateParameters";

export interface EditableTemplateParameter extends TemplateParameterOption {
  id: string;
  required: boolean;
  defaultValue: string;
}

interface TemplateParametersPanelProps {
  parameters: EditableTemplateParameter[];
  onChange(parameters: EditableTemplateParameter[]): void;
}

export function TemplateParametersPanel({
  parameters,
  onChange,
}: TemplateParametersPanelProps) {
  const [draftKey, setDraftKey] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addParameter = () => {
    const key = normalizeParameterKey(draftKey);
    if (!key || !isValidParameterKey(key)) {
      setError("Use UPPER_SNAKE_CASE keys, e.g. NEW_COMPANY_NAME");
      return;
    }
    if (parameters.some((param) => param.key === key)) {
      setError("That parameter already exists");
      return;
    }
    const label = draftLabel.trim() || humanizeParameterKey(key);
    onChange([
      ...parameters,
      {
        id: crypto.randomUUID(),
        key,
        label,
        required: true,
        defaultValue: "",
      },
    ]);
    setDraftKey("");
    setDraftLabel("");
    setError(null);
  };

  const updateParameter = (
    id: string,
    patch: Partial<EditableTemplateParameter>
  ) => {
    onChange(
      parameters.map((param) =>
        param.id === id ? { ...param, ...patch } : param
      )
    );
  };

  const removeParameter = (id: string) => {
    onChange(parameters.filter((param) => param.id !== id));
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Parameters</Label>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Define values once, then type {"{{"} in title or task fields to insert
          them.
        </p>
      </div>

      {parameters.length > 0 ? (
        <ul className="space-y-2">
          {parameters.map((param) => (
            <li
              key={param.id}
              className="grid gap-2 rounded-md border border-border/60 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">
                  Key
                </p>
                <Input
                  value={param.key}
                  className="h-8 font-mono text-[12px]"
                  onChange={(event) => {
                    const key = normalizeParameterKey(event.target.value);
                    updateParameter(param.id, {
                      key,
                      label:
                        param.label === humanizeParameterKey(param.key)
                          ? humanizeParameterKey(key || param.key)
                          : param.label,
                    });
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">
                  Label
                </p>
                <Input
                  value={param.label}
                  className="h-8 text-[12px]"
                  onChange={(event) =>
                    updateParameter(param.id, { label: event.target.value })
                  }
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  onClick={() => removeParameter(param.id)}
                  aria-label={`Remove ${param.key}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border/70 px-3 py-2 text-[12px] text-muted-foreground">
          No parameters yet. Add one below, then insert with {"{{"} in fields.
        </p>
      )}

      <div className="grid gap-2 rounded-md border border-border/50 bg-muted/20 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="space-y-1">
          <Label htmlFor="new-param-key" className="text-[11px]">
            New key
          </Label>
          <Input
            id="new-param-key"
            value={draftKey}
            className="h-8 font-mono text-[12px]"
            placeholder="NEW_COMPANY_NAME"
            onChange={(event) => {
              setDraftKey(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addParameter();
              }
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-param-label" className="text-[11px]">
            Label
          </Label>
          <Input
            id="new-param-label"
            value={draftLabel}
            className="h-8 text-[12px]"
            placeholder="New company name"
            onChange={(event) => setDraftLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addParameter();
              }
            }}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={addParameter}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
    </div>
  );
}
