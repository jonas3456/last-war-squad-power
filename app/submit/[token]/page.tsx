import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { SubmissionForm } from "@/components/submit/submission-form";
import { SubmissionHistory } from "@/components/submit/submission-history";
import type { PowerEntry } from "@/lib/types";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const serviceClient = createServiceClient();

  // Look up player by token
  const { data: player } = await serviceClient
    .from("players")
    .select("id, name")
    .eq("token", token)
    .single();

  if (!player) {
    notFound();
  }

  // Get all entries for this player (recent first)
  const { data: entries } = await serviceClient
    .from("power_entries")
    .select("*")
    .eq("player_id", player.id)
    .order("submitted_at", { ascending: false })
    .limit(20);

  const allEntries = (entries as PowerEntry[]) ?? [];
  const latestEntry = allEntries.length > 0
    ? { squad1: allEntries[0].squad1, squad2: allEntries[0].squad2, squad3: allEntries[0].squad3, squad4: allEntries[0].squad4 }
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-8">
      <SubmissionForm
        token={token}
        playerName={player.name}
        latestEntry={latestEntry}
      />
      {allEntries.length > 0 && (
        <SubmissionHistory token={token} entries={allEntries} />
      )}
    </div>
  );
}
