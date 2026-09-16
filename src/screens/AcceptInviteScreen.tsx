import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import { WebLoader } from "@/components/WebLoader";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { spydrApi } from "@/domain/spydr/utils/api";
import { useAcceptInviteMutation } from "@/domain/spydr/features/organizations/hooks/useAcceptInviteMutation";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";

export default function AcceptInviteScreen() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { setActiveOrgId } = useOrganizationContext();
  const acceptMutation = useAcceptInviteMutation();

  const inviteQuery = useQuery({
    queryKey: ["spydr", "invite", token],
    queryFn: () => spydrApi.invites.get(token as string),
    enabled: isLoaded && isSignedIn && Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (!token) navigate("/", { replace: true });
  }, [navigate, token]);

  async function handleAccept() {
    if (!token) return;
    const accepted = await acceptMutation.mutateAsync(token);
    setActiveOrgId(accepted.organizationId);
    navigate("/today", { replace: true });
  }

  const error =
    inviteQuery.error instanceof Error
      ? inviteQuery.error.message.replace(/^HTTP \d+:\s*/, "")
      : acceptMutation.error instanceof Error
        ? acceptMutation.error.message.replace(/^HTTP \d+:\s*/, "")
        : null;

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card/60 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/12 text-highlight ring-1 ring-highlight/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Join organization</h1>
            <p className="text-sm text-muted-foreground">
              Accept this invitation to become a member.
            </p>
          </div>
        </div>

        {inviteQuery.isLoading ? (
          <WebLoader size="sm" label="Loading invite" />
        ) : inviteQuery.data ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
              <p className="text-sm font-medium">{inviteQuery.data.organizationName}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Role · {inviteQuery.data.role}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{inviteQuery.data.email}</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              disabled={acceptMutation.isPending || inviteQuery.data.status !== "pending"}
              onClick={handleAccept}
            >
              {acceptMutation.isPending ? "Joining…" : "Accept invitation"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-destructive">{error ?? "Invite not found or expired."}</p>
        )}
      </div>
    </div>
  );
}
