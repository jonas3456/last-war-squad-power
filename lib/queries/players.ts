import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/queries/auth";
import type { Player } from "@/lib/types";

export async function getPlayersForAlliance(): Promise<Player[]> {
  const auth = await getAuthContext();
  if (!auth) return [];

  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("alliance_id", auth.allianceId)
    .order("name");

  return (players as Player[]) ?? [];
}
