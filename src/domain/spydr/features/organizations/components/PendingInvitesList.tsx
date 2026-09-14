import { useAcceptInviteMutation } from "../hooks/useAcceptInviteMutation";
import { useMyInvitesQuery } from "../hooks/useMyInvitesQuery";
import { useOrganizationContext } from "../context/OrganizationContext";
import { Button } from "@/components/ui/button";
import type { OrganizationInvite } from "@/domain/spydr/utils/types";

export function PendingInvitesList({ className }: { className?: string }) {
  const { data: invites = [], isLoading } = useMyInvitesQuery();
  const acceptMutation = useAcceptInviteMutation();
  const { setActiveOrgId } = useOrganizationContext();

  if (isLoading || invites.length === 0) return null;

  async function handleAccept(invite: OrganizationInvite) {
    if (!invite.token) return;
    const accepted = await acceptMutation.mutateAsync(invite.token);
    setActiveOrgId(accepted.organizationId);
  }

  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-medium">Pending invitations</h2>
      <ul className="space-y-2">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{invite.organizationName}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {invite.role}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={acceptMutation.isPending || !invite.token}
              onClick={() => handleAccept(invite)}
            >
              Accept
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
