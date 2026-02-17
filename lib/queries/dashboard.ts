import { createClient } from "@/lib/supabase/server";
import type { PlayerWithLatestEntry } from "@/lib/types";

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { players: [], alliance: null };

  const { data: leader } = await supabase
    .from("leaders")
    .select("alliance_id")
    .eq("user_id", user.id)
    .single();

  if (!leader) return { players: [], alliance: null };

  const { data: alliance } = await supabase
    .from("alliances")
    .select("*")
    .eq("id", leader.alliance_id)
    .single();

  const { data: players } = await supabase
    .from("player_latest_power")
    .select("*")
    .eq("alliance_id", leader.alliance_id)
    .order("name");

  return {
    players: (players as PlayerWithLatestEntry[]) ?? [],
    alliance,
  };
}

export function computeStats(players: PlayerWithLatestEntry[]) {
  const withData = players.filter((p) => p.total_power !== null);

  const totalPower = withData.reduce((sum, p) => sum + (p.total_power ?? 0), 0);
  const averagePower =
    withData.length > 0 ? Math.round(totalPower / withData.length) : 0;
  const submissionRate =
    players.length > 0
      ? Math.round((withData.length / players.length) * 100)
      : 0;

  let strongestSquad = "—";
  let weakestSquad = "—";

  if (withData.length > 0) {
    const squadTotals = [0, 0, 0, 0];
    withData.forEach((p) => {
      squadTotals[0] += p.squad1 ?? 0;
      squadTotals[1] += p.squad2 ?? 0;
      squadTotals[2] += p.squad3 ?? 0;
      squadTotals[3] += p.squad4 ?? 0;
    });

    const maxIdx = squadTotals.indexOf(Math.max(...squadTotals));
    const minIdx = squadTotals.indexOf(Math.min(...squadTotals));
    strongestSquad = `Squad ${maxIdx + 1}`;
    weakestSquad = `Squad ${minIdx + 1}`;
  }

  return {
    totalPower,
    averagePower,
    submissionRate,
    playerCount: players.length,
    strongestSquad,
    weakestSquad,
  };
}
