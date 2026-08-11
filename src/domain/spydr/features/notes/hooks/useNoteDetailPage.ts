import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useNoteQuery, useProjectsQuery } from "@/domain/spydr/features/shared/hooks/queries";
import type { NoteNode } from "@/domain/spydr/utils/types";
import { useUpdateNoteMutation } from "./useUpdateNoteMutation";

export interface NoteDetailFormValues {
  title: string;
  body: string;
}

export type NoteDetailSaveState = "idle" | "pending" | "saving" | "saved" | "error";

const emptyForm: NoteDetailFormValues = {
  title: "",
  body: "",
};

const SAVE_DEBOUNCE_MS = 700;

function noteToForm(note: NoteNode): NoteDetailFormValues {
  return {
    title: note.title,
    body: note.body,
  };
}

function serializeForm(form: NoteDetailFormValues) {
  return JSON.stringify(form);
}

function formToInput(form: NoteDetailFormValues) {
  return {
    title: form.title,
    body: form.body,
  };
}

export function useNoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const query = useNoteQuery(noteId);
  const projectsQuery = useProjectsQuery();
  const note = query.data;
  const projects = projectsQuery.data ?? [];
  const updateNote = useUpdateNoteMutation(noteId);
  const [form, setForm] = useState<NoteDetailFormValues>(emptyForm);
  const [saveState, setSaveState] = useState<NoteDetailSaveState>("idle");
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    hydratedRef.current = false;
    setSaveState("idle");
  }, [noteId]);

  useEffect(() => {
    if (!note) return;
    setForm(noteToForm(note));
    hydratedRef.current = true;
  }, [note?.id]);

  useEffect(() => {
    if (!note || !hydratedRef.current) return;

    const fromServer = noteToForm(note);
    if (serializeForm(form) === serializeForm(fromServer)) return;

    setSaveState("pending");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveState("saving");
      updateNote.mutate(
        { id: note.id, input: formToInput(form) },
        {
          onSuccess: () => setSaveState("saved"),
          onError: () => setSaveState("error"),
        }
      );
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimerRef.current);
  }, [form, note, updateNote.mutate]);

  const updateField = <TField extends keyof NoteDetailFormValues>(
    field: TField,
    value: NoteDetailFormValues[TField]
  ) => setForm((current) => ({ ...current, [field]: value }));

  return {
    note,
    noteId,
    projects,
    form,
    saveState,
    updateField,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load note",
  };
}
