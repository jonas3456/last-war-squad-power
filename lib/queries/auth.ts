import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { LeaderRole } from "@/lib/types";

export interface AuthContext {
  userId: string;
  username: string;
  leaderId: string;
  allianceId: string;
  allianceName: string;
  role: LeaderRole;
}

/**
 * Cached per-request: fetches user + leader + alliance in 3 queries,
 * but deduplicated across all components in the same render.
 */
export const getAuthContext = cache(
  async (): Promise<AuthContext | null> => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: leader } = await supabase
      .from("leaders")
      .select("id, alliance_id, role")
      .eq("user_id", user.id)
      .single();
    if (!leader) return null;

    const { data: alliance } = await supabase
      .from("alliances")
      .select("name")
      .eq("id", leader.alliance_id)
      .single();

    return {
      userId: user.id,
      username: (user.user_metadata?.username as string) ?? "unknown",
      leaderId: leader.id,
      allianceId: leader.alliance_id,
      allianceName: alliance?.name ?? "My Alliance",
      role: leader.role as LeaderRole,
    };
  }
);
