import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { LeaderRole } from "@/lib/types";

export interface LeaderInfo {
  id: string;
  user_id: string;
  role: LeaderRole;
  username: string;
  created_at: string;
}

export async function getLeadersForAlliance(): Promise<LeaderInfo[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: myLeader } = await supabase
    .from("leaders")
    .select("alliance_id")
    .eq("user_id", user.id)
    .single();

  if (!myLeader) return [];

  const { data: leaders } = await supabase
    .from("leaders")
    .select("id, user_id, role, created_at")
    .eq("alliance_id", myLeader.alliance_id)
    .order("created_at");

  if (!leaders) return [];

  // Resolve usernames via service role admin API
  const serviceClient = createServiceClient();
  const usernameMap = new Map<string, string>();

  // Current user's username from metadata
  usernameMap.set(
    user.id,
    (user.user_metadata?.username as string) ?? "unknown"
  );

  for (const l of leaders) {
    if (!usernameMap.has(l.user_id)) {
      const { data } = await serviceClient.auth.admin.getUserById(l.user_id);
      usernameMap.set(
        l.user_id,
        (data?.user?.user_metadata?.username as string) ?? "unknown"
      );
    }
  }

  return leaders.map((l) => ({
    ...l,
    role: l.role as LeaderRole,
    username: usernameMap.get(l.user_id) ?? "unknown",
  }));
}

export async function getCurrentLeaderRole(): Promise<LeaderRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: leader } = await supabase
    .from("leaders")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return (leader?.role as LeaderRole) ?? null;
}

export async function getAllianceInviteToken(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: leader } = await supabase
    .from("leaders")
    .select("alliance_id")
    .eq("user_id", user.id)
    .single();
  if (!leader) return null;

  const { data: alliance } = await supabase
    .from("alliances")
    .select("invite_token")
    .eq("id", leader.alliance_id)
    .single();

  return alliance?.invite_token ?? null;
}
