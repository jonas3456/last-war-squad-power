import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/queries/auth";
import type { PlayerWithLatestEntry } from "@/lib/types";

export async function getDashboardData() {
  const auth = await getAuthContext();
  if (!auth) return { players: [] };

  const supabase = await createClient();

  const { data: latestPlayers } = await supabase
    .from("player_latest_power")
    .select("*")
    .eq("alliance_id", auth.allianceId)
    .order("name");

  const players = (latestPlayers as Omit<PlayerWithLatestEntry, "prev_total_power">[]) ?? [];

  // Fetch previous entry per player to compute % change
  const playerIds = players.map((p) => p.id);
  let prevTotalByPlayer: Record<string, number> = {};
  if (playerIds.length > 0) {
    const { data: entries } = await supabase
      .from("power_entries")
      .select("player_id, total_power, submitted_at")
      .in("player_id", playerIds)
      .order("submitted_at", { ascending: false });

    if (entries) {
      const seen = new Set<string>();
      for (const entry of entries) {
        if (seen.has(entry.player_id)) {
          if (!(entry.player_id in prevTotalByPlayer)) {
            prevTotalByPlayer[entry.player_id] = entry.total_power;
          }
        } else {
          seen.add(entry.player_id);
        }
      }
    }
  }

  return {
    players: players.map((p) => ({
      ...p,
      prev_total_power: prevTotalByPlayer[p.id] ?? null,
    })) as PlayerWithLatestEntry[],
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
