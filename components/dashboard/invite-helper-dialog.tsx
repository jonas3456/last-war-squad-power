"use client";

import { useState } from "react";
import { generateInviteLink } from "@/lib/actions/leaders";
import { getBaseUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function InviteLinkSection({
  inviteToken,
}: {
  inviteToken: string | null;
}) {
  const [token, setToken] = useState(inviteToken);
  const [regenerating, setRegenerating] = useState(false);
  const baseUrl = getBaseUrl();

  const inviteUrl = token ? `${baseUrl}/join/${token}` : null;

  function copyLink() {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      toast({ title: "Invite link copied to clipboard" });
    }
  }

  async function handleRegenerate() {
    if (!confirm("Regenerate invite link? The old link will stop working.")) return;
    setRegenerating(true);
    const result = await generateInviteLink();
    setRegenerating(false);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else if (result?.token) {
      setToken(result.token);
      toast({ title: "Invite link regenerated" });
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link className="h-4 w-4" />
        Leader Invite Link
      </div>
      <p className="text-sm text-muted-foreground">
        Share this link with people you want to invite as R4 leaders. They&apos;ll
        create their own username and password.
      </p>
      <div className="flex gap-2">
        <Input
          readOnly
          value={inviteUrl ?? "No invite link generated yet"}
          className="font-mono text-xs"
        />
        <Button variant="outline" size="icon" onClick={copyLink} disabled={!inviteUrl}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
