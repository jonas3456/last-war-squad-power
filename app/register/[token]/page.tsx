import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/register/register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const serviceClient = createServiceClient();

  const { data: alliance } = await serviceClient
    .from("alliances")
    .select("id, name")
    .eq("player_invite_token", token)
    .single();

  if (!alliance) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <RegisterForm inviteToken={token} allianceName={alliance.name} />
    </div>
  );
}
