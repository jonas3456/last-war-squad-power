import { getDashboardData, computeStats } from "@/lib/queries/dashboard";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { DashboardTable } from "@/components/dashboard/dashboard-table";

export default async function DashboardPage() {
  const { players } = await getDashboardData();
  const stats = computeStats(players);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Alliance squad power overview
        </p>
      </div>
      <SummaryCards {...stats} />
      <DashboardTable players={players} />
    </div>
  );
}
