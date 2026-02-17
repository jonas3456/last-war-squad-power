import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/queries/auth";
import type { LeaderRole } from "@/lib/types";

export interface LeaderInfo {
  id: string;
  user_id: string;
  role: LeaderRole;
  username: string;
  created_at: string;
}

export async function getLeadersForAlliance(): Promise<LeaderInfo[]> {
  const auth = await getAuthContext();
  if (!auth) return [];

  const supabase = await createClient();

  const { data: leaders } = await supabase
    .from("leaders")
    .select("id, user_id, role, username, created_at")
    .eq("alliance_id", auth.allianceId)
    .order("created_at");

  if (!leaders) return [];

  return leaders.map((l) => ({
    ...l,
    role: l.role as LeaderRole,
  }));
}

export async function getAllianceInviteToken(): Promise<string | null> {
  const auth = await getAuthContext();
  if (!auth) return null;

  const supabase = await createClient();

  const { data: alliance } = await supabase
    .from("alliances")
    .select("invite_token")
    .eq("id", auth.allianceId)
    .single();

  return alliance?.invite_token ?? null;
}
