"use client";

import { useState } from "react";
import { generatePlayerInviteLink } from "@/lib/actions/players";
import { getBaseUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PlayerInviteLink({
  inviteToken,
}: {
  inviteToken: string | null;
}) {
  const [token, setToken] = useState(inviteToken);
  const [regenerating, setRegenerating] = useState(false);
  const baseUrl = getBaseUrl();

  const inviteUrl = token ? `${baseUrl}/register/${token}` : null;

  function copyLink() {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      toast({ title: "Player invite link copied to clipboard" });
    }
  }

  async function handleRegenerate() {
    if (token && !confirm("Regenerate link? The old link will stop working.")) return;
    setRegenerating(true);
    const result = await generatePlayerInviteLink();
    setRegenerating(false);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else if (result?.token) {
      setToken(result.token);
      toast({ title: token ? "Link regenerated" : "Link generated" });
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link className="h-4 w-4" />
        Player Self-Registration Link
      </div>
      <p className="text-sm text-muted-foreground">
        Share this link with your alliance. Players can register themselves and
        get their own submission link.
      </p>
      <div className="flex gap-2">
        {inviteUrl ? (
          <>
            <Input readOnly value={inviteUrl} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyLink}>
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
          </>
        ) : (
          <Button onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? "Generating..." : "Generate Link"}
          </Button>
        )}
      </div>
    </div>
  );
}
