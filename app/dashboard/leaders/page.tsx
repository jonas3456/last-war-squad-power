import { getAuthContext } from "@/lib/queries/auth";
import { getLeadersForAlliance, getAllianceInviteToken } from "@/lib/queries/leaders";
import { LeadersTable } from "@/components/dashboard/leaders-table";
import { InviteLinkSection } from "@/components/dashboard/invite-helper-dialog";

export default async function LeadersPage() {
  const [auth, leaders, inviteToken] = await Promise.all([
    getAuthContext(),
    getLeadersForAlliance(),
    getAllianceInviteToken(),
  ]);

  const currentRole = auth?.role ?? "helper";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaders</h1>
        <p className="text-muted-foreground">
          Manage who can access and edit your alliance data
        </p>
      </div>
      {currentRole === "boss" && (
        <InviteLinkSection inviteToken={inviteToken} />
      )}
      <LeadersTable leaders={leaders} currentRole={currentRole} />
    </div>
  );
}
