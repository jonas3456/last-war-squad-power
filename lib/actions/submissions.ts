"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

function parsePower(raw: string | null): number | null {
  if (!raw || raw.trim() === "") return null;
  let cleaned = raw.trim().replace(/\s/g, "");
  // Accept both comma and dot as decimal separator:
  // If both exist, the last one is the decimal separator.
  // If only one exists, treat it as decimal separator.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastComma > lastDot) {
    // Comma is the decimal separator (e.g. "32,12" or "1.000,50")
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    // Dot is the decimal separator (e.g. "32.12" or "1,000.50")
    cleaned = cleaned.replace(/,/g, "");
  }
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num;
}

export async function submitPower(token: string, formData: FormData) {
  const squad1 = parsePower(formData.get("squad1") as string);
  const squad2 = parsePower(formData.get("squad2") as string);
  const squad3 = parsePower(formData.get("squad3") as string);
  const squad4 = parsePower(formData.get("squad4") as string) ?? 0;

  if (squad1 === null || squad2 === null || squad3 === null) {
    return { error: "Squads 1-3 are required and must be valid numbers" };
  }

  if (squad1 < 0 || squad2 < 0 || squad3 < 0 || squad4 < 0) {
    return { error: "Power values must be non-negative" };
  }

  const serviceClient = createServiceClient();

  // Look up player by token
  const { data: player, error: playerError } = await serviceClient
    .from("players")
    .select("id")
    .eq("token", token)
    .single();

  if (playerError || !player) {
    return { error: "Invalid invite link" };
  }

  // Rate limit: check last submission
  const { data: lastEntry } = await serviceClient
    .from("power_entries")
    .select("submitted_at")
    .eq("player_id", player.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  if (lastEntry) {
    const diff = Date.now() - new Date(lastEntry.submitted_at).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    if (diff < fiveMinutes) {
      const remaining = Math.ceil((fiveMinutes - diff) / 60000);
      return {
        error: `Please wait ${remaining} minute${remaining > 1 ? "s" : ""} before submitting again`,
      };
    }
  }

  // Insert power entry (total_power is computed by trigger)
  const { error: insertError } = await serviceClient
    .from("power_entries")
    .insert({
      player_id: player.id,
      squad1,
      squad2,
      squad3,
      squad4,
    });

  if (insertError) {
    return { error: "Failed to save power data" };
  }

  const total = squad1 + squad2 + squad3 + squad4;
  revalidatePath(`/submit/${token}`);
  return { success: true, total };
}

const SIX_HOURS = 6 * 60 * 60 * 1000;

export async function updateEntry(
  token: string,
  entryId: string,
  formData: FormData
) {
  const squad1 = parsePower(formData.get("squad1") as string);
  const squad2 = parsePower(formData.get("squad2") as string);
  const squad3 = parsePower(formData.get("squad3") as string);
  const squad4 = parsePower(formData.get("squad4") as string) ?? 0;

  if (squad1 === null || squad2 === null || squad3 === null) {
    return { error: "Squads 1-3 are required and must be valid numbers" };
  }

  if (squad1 < 0 || squad2 < 0 || squad3 < 0 || squad4 < 0) {
    return { error: "Power values must be non-negative" };
  }

  const serviceClient = createServiceClient();

  // Verify token
  const { data: player } = await serviceClient
    .from("players")
    .select("id")
    .eq("token", token)
    .single();

  if (!player) return { error: "Invalid invite link" };

  // Verify entry belongs to this player and is within 6h
  const { data: entry } = await serviceClient
    .from("power_entries")
    .select("id, player_id, submitted_at")
    .eq("id", entryId)
    .eq("player_id", player.id)
    .single();

  if (!entry) return { error: "Entry not found" };

  const age = Date.now() - new Date(entry.submitted_at).getTime();
  if (age > SIX_HOURS) {
    return { error: "Entries can only be edited within 6 hours of submission" };
  }

  const { error: updateError } = await serviceClient
    .from("power_entries")
    .update({ squad1, squad2, squad3, squad4 })
    .eq("id", entryId);

  if (updateError) return { error: "Failed to update entry" };

  revalidatePath(`/submit/${token}`);
  return { success: true };
}
