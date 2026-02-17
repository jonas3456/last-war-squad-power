"use client";

import { useState, useTransition } from "react";
import type { PowerEntry } from "@/lib/types";
import { formatPower } from "@/lib/utils";
import { leaderUpdateEntry, leaderDeleteEntry } from "@/lib/actions/entries";
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
import { Pencil, Trash2 } from "lucide-react";

export function HistoryTable({
  entries,
  playerId,
}: {
  entries: PowerEntry[];
  playerId: string;
}) {
  const [editEntry, setEditEntry] = useState<PowerEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<PowerEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No entries yet</p>
      </div>
    );
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
            {entries.map((entry) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

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
