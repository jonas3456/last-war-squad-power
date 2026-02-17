"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function usernameToEmail(username: string): string {
  return `${username.toLowerCase().replace(/[^a-z0-9_-]/g, "")}@internal.local`;
}

export async function joinAlliance(inviteToken: string, formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "All fields are required" };
  }

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters" };
  }

  const serviceClient = createServiceClient();

  // Look up alliance by invite token
  const { data: alliance } = await serviceClient
    .from("alliances")
    .select("id, name")
    .eq("invite_token", inviteToken)
    .single();

  if (!alliance) {
    return { error: "Invalid invite link" };
  }

  const supabase = await createClient();
  const email = usernameToEmail(username);

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Username already taken" };
    }
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  // Check if already a leader in this alliance
  const { data: existing } = await serviceClient
    .from("leaders")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("alliance_id", alliance.id)
    .single();

  if (existing) {
    redirect("/dashboard");
  }

  // Create leader as helper
  const { error: leaderError } = await serviceClient.from("leaders").insert({
    user_id: authData.user.id,
    alliance_id: alliance.id,
    role: "helper",
  });

  if (leaderError) {
    return { error: "Failed to join alliance" };
  }

  redirect("/dashboard");
}
