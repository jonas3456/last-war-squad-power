"use client";

import { useState, useCallback } from "react";
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
import { formatPower } from "@/lib/utils";

const LINES: { key: string; color: string; dashed?: boolean }[] = [
  { key: "Squad 1", color: "#e76e50" },
  { key: "Squad 2", color: "#2a9d8f" },
  { key: "Squad 3", color: "#e9c46a" },
  { key: "Squad 4", color: "#264653" },
  { key: "Total", color: "#7c3aed", dashed: true },
];

export function PowerChart({ entries }: { entries: PowerEntry[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const handleLegendClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (entry: any) => {
      const key = entry.dataKey as string;
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    []
  );

  const data = [...entries]
    .sort(
      (a, b) =>
        new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    )
    .map((e) => ({
      date: new Date(e.submitted_at).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" tickFormatter={(v) => formatPower(v)} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-card-foreground)",
            borderRadius: "0.5rem",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => formatPower(Number(value))}
        />
        <Legend
          onClick={handleLegendClick}
          wrapperStyle={{ cursor: "pointer" }}
          formatter={(value: string) => (
            <span style={{ opacity: hidden.has(value) ? 0.4 : 1 }}>
              {value}
            </span>
          )}
        />
        {LINES.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            hide={hidden.has(line.key)}
            strokeDasharray={line.dashed ? "5 5" : undefined}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
