"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/queries/auth";

function parsePower(raw: string | null): number | null {
  if (!raw || raw.trim() === "") return null;
  let cleaned = raw.trim().replace(/\s/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastComma > lastDot) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    cleaned = cleaned.replace(/,/g, "");
  }
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num;
}

export async function leaderUpdateEntry(
  playerId: string,
  entryId: string,
  formData: FormData
) {
  const auth = await getAuthContext();
  if (!auth) return { error: "Not authenticated" };

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

  const supabase = await createClient();

  const { error } = await supabase
    .from("power_entries")
    .update({ squad1, squad2, squad3, squad4 })
    .eq("id", entryId)
    .eq("player_id", playerId);

  if (error) return { error: "Failed to update entry" };

  revalidatePath(`/dashboard/players/${playerId}/history`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function leaderDeleteEntry(playerId: string, entryId: string) {
  const auth = await getAuthContext();
  if (!auth) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("power_entries")
    .delete()
    .eq("id", entryId)
    .eq("player_id", playerId);

  if (error) return { error: "Failed to delete entry" };

  revalidatePath(`/dashboard/players/${playerId}/history`);
  revalidatePath("/dashboard");
  return { success: true };
}
