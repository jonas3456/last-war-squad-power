"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function requireBoss() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: leader } = await supabase
    .from("leaders")
    .select("id, alliance_id, role")
    .eq("user_id", user.id)
    .single();

  if (!leader) throw new Error("No alliance found");
  if (leader.role !== "boss") throw new Error("Only R5 can do this");

  return { supabase, userId: user.id, leaderId: leader.id, allianceId: leader.alliance_id };
}

export async function generateInviteLink() {
  const { allianceId } = await requireBoss();
  const serviceClient = createServiceClient();
  const token = nanoid(21);

  const { error } = await serviceClient
    .from("alliances")
    .update({ invite_token: token })
    .eq("id", allianceId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/leaders");
  return { success: true, token };
}

export async function removeHelper(leaderId: string) {
  if (!leaderId) return { error: "Leader ID is required" };

  const { allianceId } = await requireBoss();
  const serviceClient = createServiceClient();

  const { data: leader } = await serviceClient
    .from("leaders")
    .select("id, role")
    .eq("id", leaderId)
    .eq("alliance_id", allianceId)
    .single();

  if (!leader) return { error: "Leader not found" };
  if (leader.role === "boss") return { error: "Cannot remove R5" };

  const { error } = await serviceClient
    .from("leaders")
    .delete()
    .eq("id", leaderId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/leaders");
  return { success: true };
}

export async function transferR5(targetLeaderId: string) {
  if (!targetLeaderId) return { error: "Leader ID is required" };

  const { leaderId, allianceId } = await requireBoss();
  const serviceClient = createServiceClient();

  // Verify target is an R4 in the same alliance
  const { data: target } = await serviceClient
    .from("leaders")
    .select("id, role")
    .eq("id", targetLeaderId)
    .eq("alliance_id", allianceId)
    .single();

  if (!target) return { error: "Leader not found" };
  if (target.role === "boss") return { error: "Already R5" };

  // Swap: promote target to boss, demote self to helper
  const { error: promoteError } = await serviceClient
    .from("leaders")
    .update({ role: "boss" })
    .eq("id", targetLeaderId);

  if (promoteError) return { error: promoteError.message };

  const { error: demoteError } = await serviceClient
    .from("leaders")
    .update({ role: "helper" })
    .eq("id", leaderId);

  if (demoteError) return { error: demoteError.message };

  revalidatePath("/dashboard/leaders");
  return { success: true };
}

export async function resetLeaderPassword(targetLeaderId: string) {
  if (!targetLeaderId) return { error: "Leader ID is required" };

  const { allianceId } = await requireBoss();
  const serviceClient = createServiceClient();

  // Verify target is in the same alliance
  const { data: target } = await serviceClient
    .from("leaders")
    .select("id, user_id")
    .eq("id", targetLeaderId)
    .eq("alliance_id", allianceId)
    .single();

  if (!target) return { error: "Leader not found" };

  // Generate a temporary password
  const tempPassword = nanoid(12);

  const { error } = await serviceClient.auth.admin.updateUserById(
    target.user_id,
    { password: tempPassword }
  );

  if (error) return { error: error.message };

  return { success: true, tempPassword };
}
