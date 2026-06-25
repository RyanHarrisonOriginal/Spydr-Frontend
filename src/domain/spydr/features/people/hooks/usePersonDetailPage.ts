import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { usePersonQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useUpdatePersonMutation } from "./useUpdatePersonMutation";

export interface PersonDetailFormValues {
  fullName: string;
  body: string;
  email: string;
  title: string;
  organization: string;
  relationshipContext: string;
}

export type PersonDetailSaveState = "idle" | "pending" | "saving" | "saved" | "error";

const emptyForm: PersonDetailFormValues = {
  fullName: "",
  body: "",
  email: "",
  title: "",
  organization: "",
  relationshipContext: "",
};

const SAVE_DEBOUNCE_MS = 700;

function personToForm(person: NonNullable<ReturnType<typeof usePersonQuery>["data"]>) {
  return {
    fullName: person.details?.fullName ?? person.title,
    body: person.body,
    email: person.details?.email ?? "",
    title: person.details?.title ?? "",
    organization: person.details?.organization ?? "",
    relationshipContext: person.details?.relationshipContext ?? "",
  };
}

function serializeForm(form: PersonDetailFormValues) {
  return JSON.stringify(form);
}

export function usePersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  const query = usePersonQuery(personId);
  const person = query.data;
  const updatePerson = useUpdatePersonMutation(personId);
  const [form, setForm] = useState<PersonDetailFormValues>(emptyForm);
  const [saveState, setSaveState] = useState<PersonDetailSaveState>("idle");
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    hydratedRef.current = false;
    setSaveState("idle");
  }, [personId]);

  useEffect(() => {
    if (!person) return;
    setForm(personToForm(person));
    hydratedRef.current = true;
  }, [person?.id]);

  useEffect(() => {
    if (!person || !hydratedRef.current) return;

    const fromServer = personToForm(person);
    if (serializeForm(form) === serializeForm(fromServer)) return;

    setSaveState("pending");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveState("saving");
      updatePerson.mutate(
        {
          id: person.id,
          input: {
            fullName: form.fullName.trim(),
            body: form.body,
            email: form.email.trim() || null,
            title: form.title.trim() || null,
            organization: form.organization.trim() || null,
            relationshipContext: form.relationshipContext.trim() || null,
          },
        },
        {
          onSuccess: () => setSaveState("saved"),
          onError: () => setSaveState("error"),
        }
      );
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimerRef.current);
  }, [form, person, updatePerson.mutate]);

  const updateField = <TField extends keyof PersonDetailFormValues>(
    field: TField,
    value: PersonDetailFormValues[TField]
  ) => setForm((current) => ({ ...current, [field]: value }));

  return {
    person,
    personId,
    form,
    saveState,
    updateField,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load person",
  };
}
