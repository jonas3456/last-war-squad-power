import { getPlayersForAlliance } from "@/lib/queries/players";
import { createClient } from "@/lib/supabase/server";
import { PlayerTable } from "@/components/dashboard/player-table";
import { AddPlayerDialog } from "@/components/dashboard/add-player-dialog";
import { PlayerInviteLink } from "@/components/dashboard/player-invite-link";

export default async function PlayersPage() {
  const players = await getPlayersForAlliance();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let playerInviteToken: string | null = null;
  if (user) {
    const { data: leader } = await supabase
      .from("leaders")
      .select("alliance_id")
      .eq("user_id", user.id)
      .single();

    if (leader) {
      const { data: alliance } = await supabase
        .from("alliances")
        .select("player_invite_token")
        .eq("id", leader.alliance_id)
        .single();

      playerInviteToken = alliance?.player_invite_token ?? null;
    }
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
