import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PowerChart } from "@/components/dashboard/power-chart";
import { HistoryTable } from "@/components/dashboard/history-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { PowerEntry } from "@/lib/types";

export default async function PlayerHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify player belongs to leader's alliance
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: leader } = await supabase
    .from("leaders")
    .select("alliance_id")
    .eq("user_id", user.id)
    .single();
  if (!leader) notFound();

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .eq("alliance_id", leader.alliance_id)
    .single();

  if (!player) notFound();

  const { data: entries } = await supabase
    .from("power_entries")
    .select("*")
    .eq("player_id", id)
    .order("submitted_at", { ascending: false });

  const powerEntries = (entries as PowerEntry[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
          <p className="text-muted-foreground">
            Power history &middot; {powerEntries.length} entr{powerEntries.length === 1 ? "y" : "ies"}
          </p>
        </div>
      </div>
      <PowerChart entries={powerEntries} />
      <HistoryTable entries={powerEntries} />
    </div>
  );
}
