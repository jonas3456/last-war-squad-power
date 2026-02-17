import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { JoinForm } from "@/components/auth/join-form";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const serviceClient = createServiceClient();

  const { data: alliance } = await serviceClient
    .from("alliances")
    .select("id, name")
    .eq("invite_token", token)
    .single();

  if (!alliance) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <JoinForm inviteToken={token} allianceName={alliance.name} />
    </div>
  );
}
