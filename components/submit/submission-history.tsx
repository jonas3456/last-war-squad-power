"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { PowerEntry } from "@/lib/types";
import { formatPower } from "@/lib/utils";
import { updateEntry } from "@/lib/actions/submissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";

const SIX_HOURS = 6 * 60 * 60 * 1000;

function isEditable(submittedAt: string): boolean {
  return Date.now() - new Date(submittedAt).getTime() < SIX_HOURS;
}

export function SubmissionHistory({
  token,
  entries,
}: {
  token: string;
  entries: PowerEntry[];
}) {
  const [editEntry, setEditEntry] = useState<PowerEntry | null>(null);

  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData
    ) => {
      if (!editEntry) return { error: "No entry selected" };
      const result = await updateEntry(token, editEntry.id, formData);
      if (result?.success) {
        setEditEntry(null);
      }
      return result;
    },
    undefined
  );

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Past Submissions</CardTitle>
          <CardDescription>
            Your recent submissions. Entries less than 6 hours old can be edited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">S1</TableHead>
                <TableHead className="text-right">S2</TableHead>
                <TableHead className="text-right">S3</TableHead>
                <TableHead className="text-right">S4</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const editable = isEditable(entry.submitted_at);
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {new Date(entry.submitted_at).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {editable && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Editable
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatPower(entry.squad1)}</TableCell>
                    <TableCell className="text-right">{formatPower(entry.squad2)}</TableCell>
                    <TableCell className="text-right">{formatPower(entry.squad3)}</TableCell>
                    <TableCell className="text-right">{formatPower(entry.squad4)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPower(entry.total_power)}
                    </TableCell>
                    <TableCell>
                      {editable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditEntry(entry)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editEntry} onOpenChange={() => setEditEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>
              Update the power values for this entry.
            </DialogDescription>
          </DialogHeader>
          <form action={formAction}>
            <div className="space-y-4 py-4">
              {state?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <Label htmlFor={`edit-squad${num}`}>
                    Squad {num}{num === 4 ? " (optional)" : ""}
                  </Label>
                  <Input
                    id={`edit-squad${num}`}
                    name={`squad${num}`}
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      editEntry
                        ? formatPower(
                            editEntry[`squad${num}` as keyof PowerEntry] as number
                          )
                        : ""
                    }
                    required={num !== 4}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
