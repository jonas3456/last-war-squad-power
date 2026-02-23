"use client";

import { useState, useTransition } from "react";
import type { PowerEntry } from "@/lib/types";
import { formatPower } from "@/lib/utils";
import { leaderUpdateEntry, leaderDeleteEntry, leaderAddEntry } from "@/lib/actions/entries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";

function PctChange({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  if (pct === 0) return null;
  const sign = pct > 0 ? "+" : "";
  return (
    <span className={`block text-xs ${pct > 0 ? "text-green-500" : "text-destructive"}`}>
      {sign}{pct.toFixed(1)}%
    </span>
  );
}

export function HistoryTable({
  entries,
  playerId,
}: {
  entries: PowerEntry[];
  playerId: string;
}) {
  const [editEntry, setEditEntry] = useState<PowerEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<PowerEntry | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addDatetime, setAddDatetime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAddDialog() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    setAddDatetime(local.toISOString().slice(0, 16));
    setError(null);
    setShowAddDialog(true);
  }

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await leaderAddEntry(playerId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowAddDialog(false);
      }
    });
  }

  function handleEdit(formData: FormData) {
    if (!editEntry) return;
    setError(null);
    startTransition(async () => {
      const result = await leaderUpdateEntry(playerId, editEntry.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditEntry(null);
      }
    });
  }

  function handleDelete() {
    if (!deleteEntry) return;
    setError(null);
    startTransition(async () => {
      const result = await leaderDeleteEntry(playerId, deleteEntry.id);
      if (result?.error) {
        setError(result.error);
      } else {
        setDeleteEntry(null);
      }
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={openAddDialog}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No entries yet</p>
        </div>
      ) : (
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
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, i) => {
              const prev = entries[i + 1];
              return (
              <TableRow key={entry.id}>
                <TableCell>
                  {new Date(entry.submitted_at).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {formatPower(entry.squad1)}
                  <PctChange current={entry.squad1} previous={prev?.squad1} />
                </TableCell>
                <TableCell className="text-right">
                  {formatPower(entry.squad2)}
                  <PctChange current={entry.squad2} previous={prev?.squad2} />
                </TableCell>
                <TableCell className="text-right">
                  {formatPower(entry.squad3)}
                  <PctChange current={entry.squad3} previous={prev?.squad3} />
                </TableCell>
                <TableCell className="text-right">
                  {formatPower(entry.squad4)}
                  <PctChange current={entry.squad4} previous={prev?.squad4} />
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatPower(entry.total_power)}
                  <PctChange current={entry.total_power} previous={prev?.total_power} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setError(null);
                        setEditEntry(entry);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setError(null);
                        setDeleteEntry(entry);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      )}

      {/* Add dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          setError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Entry</DialogTitle>
            <DialogDescription>
              Manually add a power entry for this player.
            </DialogDescription>
          </DialogHeader>
          <form action={handleAdd}>
            <div className="space-y-4 py-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="add-submittedAt">Date &amp; Time</Label>
                <input
                  id="add-submittedAt"
                  name="submittedAt"
                  type="datetime-local"
                  defaultValue={addDatetime}
                  key={addDatetime}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <Label htmlFor={`add-squad${num}`}>
                    Squad {num}
                    {num === 4 ? " (optional)" : ""}
                  </Label>
                  <Input
                    id={`add-squad${num}`}
                    name={`squad${num}`}
                    type="text"
                    inputMode="numeric"
                    required={num !== 4}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editEntry}
        onOpenChange={() => {
          setEditEntry(null);
          setError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>
              Update the power values for this entry.
            </DialogDescription>
          </DialogHeader>
          <form action={handleEdit}>
            <div className="space-y-4 py-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <Label htmlFor={`edit-squad${num}`}>
                    Squad {num}
                    {num === 4 ? " (optional)" : ""}
                  </Label>
                  <Input
                    id={`edit-squad${num}`}
                    name={`squad${num}`}
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      editEntry
                        ? formatPower(
                            editEntry[
                              `squad${num}` as keyof PowerEntry
                            ] as number
                          )
                        : ""
                    }
                    required={num !== 4}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteEntry}
        onOpenChange={() => {
          setDeleteEntry(null);
          setError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission from{" "}
              {deleteEntry &&
                new Date(deleteEntry.submitted_at).toLocaleString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteEntry(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
