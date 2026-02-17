import { getAuthContext } from "@/lib/queries/auth";
import { getPlayersForAlliance } from "@/lib/queries/players";
import { createClient } from "@/lib/supabase/server";
import { PlayerTable } from "@/components/dashboard/player-table";
import { AddPlayerDialog } from "@/components/dashboard/add-player-dialog";
import { PlayerInviteLink } from "@/components/dashboard/player-invite-link";

export default async function PlayersPage() {
  const [auth, players] = await Promise.all([
    getAuthContext(),
    getPlayersForAlliance(),
  ]);

  let playerInviteToken: string | null = null;
  if (auth) {
    const supabase = await createClient();
    const { data: alliance } = await supabase
      .from("alliances")
      .select("player_invite_token")
      .eq("id", auth.allianceId)
      .single();

    playerInviteToken = alliance?.player_invite_token ?? null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Players</h1>
          <p className="text-muted-foreground">
            Manage players and their invite links
          </p>
        </div>
        <AddPlayerDialog />
      </div>
      <PlayerInviteLink inviteToken={playerInviteToken} />
      <PlayerTable players={players} />
    </div>
  );
}
