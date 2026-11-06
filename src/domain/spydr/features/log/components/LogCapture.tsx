import { useEffect, useId, useRef, useState } from "react";
import { FolderKanban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LogCaptureTargets } from "../types";

interface LogCaptureProps {
  placeholder: string;
  targets: LogCaptureTargets;
  onSubmit: (text: string, projectId: string) => Promise<void>;
  disabled?: boolean;
}

export function LogCapture({
  placeholder,
  targets,
  onSubmit,
  disabled = false,
}: LogCaptureProps) {
  const labelId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected =
    targets.projects.find((project) => project.id === targets.projectId) ??
    targets.projects[0] ??
    null;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const canSubmit =
    text.trim().length > 0 && Boolean(selected?.id) && !submitting && !disabled;

  const submit = async () => {
    if (!canSubmit || !selected) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim(), selected.id);
      setText("");
      requestAnimationFrame(() => textareaRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="log-capture">
      <div className="log-capture-field">
        <label id={labelId} className="sr-only">
          {placeholder}
        </label>
        <textarea
          ref={textareaRef}
          className="log-capture-textarea"
          aria-labelledby={labelId}
          placeholder={placeholder}
          rows={1}
          value={text}
          disabled={disabled || submitting}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              void submit();
            }
          }}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="log-capture-project"
            aria-label={
              selected
                ? `Project: ${selected.title}`
                : "Choose a project"
            }
            title={selected?.title ?? "Choose a project"}
            disabled={targets.projects.length === 0}
          >
            <FolderKanban className="h-3.5 w-3.5" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-64 w-56 overflow-y-auto">
          {targets.projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => targets.onProjectChange(project.id)}
            >
              {project.details?.emoji ? `${project.details.emoji} ` : null}
              {project.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        className="log-capture-add"
        disabled={!canSubmit}
        onClick={() => void submit()}
      >
        {submitting ? "Adding…" : "Add"}
      </button>
    </div>
  );
}
