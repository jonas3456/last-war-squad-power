"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PowerEntry } from "@/lib/types";

export function PowerChart({ entries }: { entries: PowerEntry[] }) {
  const data = [...entries]
    .sort(
      (a, b) =>
        new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    )
    .map((e) => ({
      date: new Date(e.submitted_at).toLocaleDateString(),
      "Squad 1": e.squad1,
      "Squad 2": e.squad2,
      "Squad 3": e.squad3,
      "Squad 4": e.squad4,
      Total: e.total_power,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No data to chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Squad 1" stroke="hsl(var(--chart-1))" strokeWidth={2} />
        <Line type="monotone" dataKey="Squad 2" stroke="hsl(var(--chart-2))" strokeWidth={2} />
        <Line type="monotone" dataKey="Squad 3" stroke="hsl(var(--chart-3))" strokeWidth={2} />
        <Line type="monotone" dataKey="Squad 4" stroke="hsl(var(--chart-4))" strokeWidth={2} />
        <Line type="monotone" dataKey="Total" stroke="hsl(var(--chart-5))" strokeWidth={2} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
}
