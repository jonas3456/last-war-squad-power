"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";
import { getBaseUrl } from "@/lib/utils";
import { deletePlayer, regenerateToken, updatePlayer } from "@/lib/actions/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Copy, MoreHorizontal, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PlayerTable({ players }: { players: Player[] }) {
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState("");

  const baseUrl = getBaseUrl();

  function copyInviteLink(token: string) {
    navigator.clipboard.writeText(`${baseUrl}/submit/${token}`);
    toast({ title: "Invite link copied to clipboard" });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete player "${name}"? This will also delete all their power entries.`)) {
      return;
    }
    const result = await deletePlayer(id);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: `Player "${name}" deleted` });
    }
  }

  async function handleRegenerate(id: string) {
    if (!confirm("Regenerate invite link? The old link will stop working.")) {
      return;
    }
    const result = await regenerateToken(id);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Invite link regenerated" });
    }
  }

  async function handleEdit(formData: FormData) {
    const result = await updatePlayer(formData);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      setEditPlayer(null);
      toast({ title: "Player updated" });
    }
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No players yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first player to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Invite Link</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInviteLink(player.token)}
                  className="h-8 gap-2 text-xs"
                >
                  <Copy className="h-3 w-3" />
                  Copy Link
                </Button>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditPlayer(player);
                        setEditName(player.name);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRegenerate(player.id)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(player.id, player.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editPlayer} onOpenChange={() => setEditPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>Update the player&apos;s name.</DialogDescription>
          </DialogHeader>
          <form action={handleEdit}>
            <input type="hidden" name="id" value={editPlayer?.id ?? ""} />
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Player Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
