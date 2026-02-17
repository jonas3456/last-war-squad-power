import type { PowerEntry } from "@/lib/types";
import { formatPower } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HistoryTable({ entries }: { entries: PowerEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No entries yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Squad 1</TableHead>
            <TableHead className="text-right">Squad 2</TableHead>
            <TableHead className="text-right">Squad 3</TableHead>
            <TableHead className="text-right">Squad 4</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                {new Date(entry.submitted_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {formatPower(entry.squad1)}
              </TableCell>
              <TableCell className="text-right">
                {formatPower(entry.squad2)}
              </TableCell>
              <TableCell className="text-right">
                {formatPower(entry.squad3)}
              </TableCell>
              <TableCell className="text-right">
                {formatPower(entry.squad4)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatPower(entry.total_power)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
