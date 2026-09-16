import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
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
import type { OrganizationMemberRole } from "@/domain/spydr/utils/types";
import {
  useInviteMemberMutation,
  useOrganizationInvitesQuery,
  useOrganizationMembersQuery,
  useRevokeInviteMutation,
} from "../hooks/useOrganizationMembers";

const ROLE_OPTIONS: OrganizationMemberRole[] = ["member", "admin", "owner"];

export function InviteMembersDialog({
  orgId,
  orgName,
  canInviteOwner,
  open,
  onOpenChange,
}: {
  orgId: string;
  orgName: string;
  canInviteOwner: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const membersQuery = useOrganizationMembersQuery(open ? orgId : null);
  const invitesQuery = useOrganizationInvitesQuery(open ? orgId : null);
  const inviteMutation = useInviteMemberMutation(orgId);
  const revokeMutation = useRevokeInviteMutation(orgId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationMemberRole>("member");
  const [error, setError] = useState<string | null>(null);

  const roles = canInviteOwner ? ROLE_OPTIONS : ROLE_OPTIONS.filter((item) => item !== "owner");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await inviteMutation.mutateAsync({ email: email.trim(), role });
      setEmail("");
      setRole("member");
    } catch (err) {
      setError(err instanceof Error ? err.message.replace(/^HTTP \d+:\s*/, "") : "Failed to send invite");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite people to {orgName}</DialogTitle>
          <DialogDescription>
            They receive a Clerk sign-up email if they are new, then join this organization when
            they accept.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alex@example.com"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                value={role}
                onChange={(event) => setRole(event.target.value as OrganizationMemberRole)}
                className="spydr-input"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={!email.trim() || inviteMutation.isPending} className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {inviteMutation.isPending ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>

        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Members
          </h3>
          <ul className="space-y-1.5 text-sm">
            {(membersQuery.data ?? []).map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  {member.person?.fullName ?? member.userId}
                  {member.person?.email ? (
                    <span className="text-muted-foreground"> · {member.person.email}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {member.role}
                </span>
              </li>
            ))}
          </ul>

          {(invitesQuery.data ?? []).length > 0 ? (
            <>
              <h3 className="pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Pending invites
              </h3>
              <ul className="space-y-1.5 text-sm">
                {(invitesQuery.data ?? []).map((invite) => (
                  <li key={invite.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {invite.email}
                      <span className="text-muted-foreground"> · {invite.role}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={revokeMutation.isPending}
                      onClick={() => revokeMutation.mutate(invite.id)}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InviteMembersButton({
  orgId,
  orgName,
  canInviteOwner,
}: {
  orgId: string;
  orgName: string;
  canInviteOwner: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 px-2 text-[13px]"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Invite
      </Button>
      <InviteMembersDialog
        orgId={orgId}
        orgName={orgName}
        canInviteOwner={canInviteOwner}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
