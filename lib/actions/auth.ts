"use server";

import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// We use username-based auth for privacy. Supabase requires an email,
// so we generate a fake internal email from the username.
function usernameToEmail(username: string): string {
  return `${username.toLowerCase().replace(/[^a-z0-9_-]/g, "")}@internal.local`;
}

export async function signUp(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const allianceName = (formData.get("allianceName") as string)?.trim();

  if (!username || !password || !allianceName) {
    return { error: "All fields are required" };
  }

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters" };
  }

  const supabase = await createClient();
  const serviceClient = createServiceClient();
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
    return { error: "Failed to create user" };
  }

  // Create alliance and leader using service role for atomicity
  const inviteToken = nanoid(21);
  const { data: alliance, error: allianceError } = await serviceClient
    .from("alliances")
    .insert({ name: allianceName, invite_token: inviteToken })
    .select()
    .single();

  if (allianceError) {
    return { error: "Failed to create alliance" };
  }

  const { error: leaderError } = await serviceClient.from("leaders").insert({
    user_id: authData.user.id,
    alliance_id: alliance.id,
    role: "boss",
    username,
  });

  if (leaderError) {
    return { error: "Failed to create leader record" };
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const supabase = await createClient();
  const email = usernameToEmail(username);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid username or password" };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };
  return { success: true };
}
