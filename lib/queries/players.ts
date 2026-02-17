import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types";

export async function getPlayersForAlliance(): Promise<Player[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: leader } = await supabase
    .from("leaders")
    .select("alliance_id")
    .eq("user_id", user.id)
    .single();

  if (!leader) return [];

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("alliance_id", leader.alliance_id)
    .order("name");

  return (players as Player[]) ?? [];
}
