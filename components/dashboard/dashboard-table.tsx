"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PlayerWithLatestEntry } from "@/lib/types";
import { formatPower, isStale } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortField = "name" | "total_power" | "squad1" | "squad2" | "squad3" | "squad4" | "submitted_at";
type SortDir = "asc" | "desc";

export function DashboardTable({
  players,
}: {
  players: PlayerWithLatestEntry[];
}) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    let result = players;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [players, search, sortField, sortDir]);

  function SortHeader({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => toggleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortHeader field="name">Player</SortHeader></TableHead>
              <TableHead className="text-right"><SortHeader field="squad1">S1</SortHeader></TableHead>
              <TableHead className="text-right"><SortHeader field="squad2">S2</SortHeader></TableHead>
              <TableHead className="text-right"><SortHeader field="squad3">S3</SortHeader></TableHead>
              <TableHead className="text-right"><SortHeader field="squad4">S4</SortHeader></TableHead>
              <TableHead className="text-right"><SortHeader field="total_power">Total</SortHeader></TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead><SortHeader field="submitted_at">Submitted</SortHeader></TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {search ? "No players match your search" : "No players yet"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-right">{formatPower(player.squad1)}</TableCell>
                  <TableCell className="text-right">{formatPower(player.squad2)}</TableCell>
                  <TableCell className="text-right">{formatPower(player.squad3)}</TableCell>
                  <TableCell className="text-right">{formatPower(player.squad4)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPower(player.total_power)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {player.total_power !== null && player.prev_total_power !== null && player.prev_total_power !== 0 ? (
                      (() => {
                        const pct = ((player.total_power - player.prev_total_power) / player.prev_total_power) * 100;
                        const sign = pct >= 0 ? "+" : "";
                        return (
                          <span className={pct > 0 ? "text-green-500" : pct < 0 ? "text-destructive" : "text-muted-foreground"}>
                            {sign}{pct.toFixed(1)}%
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {player.submitted_at
                      ? new Date(player.submitted_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {player.submitted_at === null ? (
                      <Badge variant="outline">No data</Badge>
                    ) : isStale(player.submitted_at) ? (
                      <Badge variant="secondary">Stale</Badge>
                    ) : (
                      <Badge>Current</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/players/${player.id}/history`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <History className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
