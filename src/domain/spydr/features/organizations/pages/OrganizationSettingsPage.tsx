import { useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { useOrganizationContext } from "../context/OrganizationContext";
import {
  useAddOrganizationMemberMutation,
  useOrganizationMembersQuery,
  useRemoveOrganizationMemberMutation,
} from "../hooks/useOrganizationMembers";
import type { OrganizationMemberRole } from "@/domain/spydr/utils/types";

const ROLE_OPTIONS: OrganizationMemberRole[] = ["member", "admin", "owner"];

function apiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.replace(/^HTTP \d+:\s*/, "");
  }
  return "Something went wrong";
}

export function OrganizationSettingsPage() {
  const { userId } = useAuth();
  const { activeOrg, activeOrgId } = useOrganizationContext();
  const membersQuery = useOrganizationMembersQuery(activeOrgId);
  const addMutation = useAddOrganizationMemberMutation(activeOrgId);
  const removeMutation = useRemoveOrganizationMemberMutation(activeOrgId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationMemberRole>("member");
  const [formError, setFormError] = useState<string | null>(null);

  usePageBreadcrumb("Settings");

  const canManageMembers =
    activeOrg?.role === "owner" || activeOrg?.role === "admin";
  const canInviteOwner = activeOrg?.role === "owner";
  const roles = canInviteOwner
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((item) => item !== "owner");

  const members = membersQuery.data ?? [];
  const ownerCount = useMemo(
    () => members.filter((member) => member.role === "owner").length,
    [members]
  );

  const showInitialLoading = membersQuery.isLoading && members.length === 0;

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    try {
      await addMutation.mutateAsync({ email: email.trim(), role });
      setEmail("");
      setRole("member");
    } catch (error) {
      setFormError(apiErrorMessage(error));
    }
  }

  async function handleRemove(memberId: string, label: string) {
    if (!window.confirm(`Remove ${label} from this organization?`)) {
      return;
    }
    setFormError(null);
    try {
      await removeMutation.mutateAsync(memberId);
    } catch (error) {
      setFormError(apiErrorMessage(error));
    }
  }

  return (
    <div>
      <PageHeader
        title="Organization"
        meta={
          <span>
            {activeOrg?.name ?? "Workspace"}
            {members.length > 0
              ? ` · ${members.length} ${members.length === 1 ? "member" : "members"}`
              : ""}
            {membersQuery.isFetching && members.length > 0 ? " · refreshing…" : ""}
          </span>
        }
      />

      {showInitialLoading ? <LoadingState title="Loading members" /> : null}

      {membersQuery.isError ? (
        <ErrorState
          title="Members unavailable"
          description={apiErrorMessage(membersQuery.error)}
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => membersQuery.refetch()}
          >
            Retry
          </Button>
        </ErrorState>
      ) : null}

      {!showInitialLoading && !membersQuery.isError ? (
        <>
          {canManageMembers ? (
            <form
              className="space-y-3 border-b border-border/60 px-4 py-4 md:px-8"
              onSubmit={handleAdd}
            >
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Add member
              </h2>
              <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="alex@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-role">Role</Label>
                  <select
                    id="member-role"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as OrganizationMemberRole)
                    }
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-[15px] text-foreground"
                  >
                    {roles.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={!email.trim() || addMutation.isPending}
                    className="h-10 gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {addMutation.isPending ? "Adding…" : "Add"}
                  </Button>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground">
                They must already have a Spydr account. Invite-by-email comes later.
              </p>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
            </form>
          ) : null}

          {members.length === 0 ? (
            <EmptyState
              title="No members yet"
              description="People who belong to this organization will appear here."
            />
          ) : (
            <ul className="divide-y divide-border/60 border-t border-border/60">
              {members.map((member) => {
                const label =
                  member.person?.fullName ??
                  member.person?.email ??
                  member.userId;
                const isCurrentUser = member.userId === userId;
                const isLastOwner =
                  member.role === "owner" && ownerCount <= 1;
                const canRemoveThisMember =
                  canManageMembers &&
                  !isLastOwner &&
                  (activeOrg?.role === "owner" || member.role !== "owner");

                return (
                  <li
                    key={member.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="truncate text-[13px] font-medium">
                          {label}
                          {isCurrentUser ? (
                            <span className="ml-1.5 text-[11px] font-normal text-highlight">
                              you
                            </span>
                          ) : null}
                        </p>
                      </div>
                      {member.person?.email ? (
                        <p className="mt-1 text-[12px] text-muted-foreground">
                          {member.person.email}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {member.role}
                      </span>
                      {canRemoveThisMember ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[11px] text-destructive"
                          disabled={removeMutation.isPending}
                          onClick={() => handleRemove(member.id, label)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
