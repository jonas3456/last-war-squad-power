"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/queries/auth";

export async function addPlayer(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Player name is required" };

  const auth = await getAuthContext();
  if (!auth) return { error: "Not authenticated" };

  const supabase = await createClient();
  const token = nanoid(21);

  const { error } = await supabase.from("players").insert({
    alliance_id: auth.allianceId,
    name: name.trim(),
    token,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/players");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePlayer(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  if (!id || !name?.trim()) return { error: "Player ID and name are required" };

  const auth = await getAuthContext();
  if (!auth) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("players")
    .update({ name: name.trim() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/players");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePlayer(id: string) {
  if (!id) return { error: "Player ID is required" };

  const auth = await getAuthContext();
  if (!auth) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/players");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function regenerateToken(id: string) {
  if (!id) return { error: "Player ID is required" };

  const auth = await getAuthContext();
  if (!auth) return { error: "Not authenticated" };

  const supabase = await createClient();
  const token = nanoid(21);

  const { error } = await supabase
    .from("players")
    .update({ token })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/players");
  return { success: true, token };
}

export async function generatePlayerInviteLink() {
  const auth = await getAuthContext();
  if (!auth) return { error: "Not authenticated" };

  const supabase = await createClient();
  const token = nanoid(21);

  const { error } = await supabase
    .from("alliances")
    .update({ player_invite_token: token })
    .eq("id", auth.allianceId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/players");
  return { success: true, token };
}

export async function selfRegisterPlayer(
  inviteToken: string,
  formData: FormData
) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Player name is required" };

  const serviceClient = createServiceClient();

  // Look up alliance by player invite token
  const { data: alliance } = await serviceClient
    .from("alliances")
    .select("id")
    .eq("player_invite_token", inviteToken)
    .single();

  if (!alliance) return { error: "Invalid invite link" };

  // Check if name already exists in this alliance
  const { data: existing } = await serviceClient
    .from("players")
    .select("id, token")
    .eq("alliance_id", alliance.id)
    .ilike("name", name)
    .single();

  if (existing) {
    // Return their existing submission link
    return { success: true, token: existing.token, existingPlayer: true };
  }

  // Create new player
  const token = nanoid(21);
  const { error } = await serviceClient.from("players").insert({
    alliance_id: alliance.id,
    name,
    token,
  });

  if (error) return { error: "Failed to register. Please try again." };

  return { success: true, token, existingPlayer: false };
}
