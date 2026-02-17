"use client";

import { useState } from "react";
import type { LeaderInfo } from "@/lib/queries/leaders";
import type { LeaderRole } from "@/lib/types";
import { roleLabel } from "@/lib/types";
import { removeHelper, transferR5, resetLeaderPassword } from "@/lib/actions/leaders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Copy, KeyRound, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function LeadersTable({
  leaders,
  currentRole,
}: {
  leaders: LeaderInfo[];
  currentRole: LeaderRole;
}) {
  const [tempPassword, setTempPassword] = useState<{ username: string; password: string } | null>(null);

  async function handleRemove(id: string, username: string) {
    if (!confirm(`Remove "${username}" from the alliance?`)) return;
    const result = await removeHelper(id);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: `"${username}" removed` });
    }
  }

  async function handleTransfer(id: string, username: string) {
    if (
      !confirm(
        `Transfer R5 to "${username}"? You will become R4.`
      )
    )
      return;
    const result = await transferR5(id);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: `R5 transferred to "${username}"` });
    }
  }

  async function handleResetPassword(id: string, username: string) {
    if (!confirm(`Reset password for "${username}"? A temporary password will be generated.`)) return;
    const result = await resetLeaderPassword(id);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else if (result?.tempPassword) {
      setTempPassword({ username, password: result.tempPassword });
    }
  }

  function copyTempPassword() {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword.password);
      toast({ title: "Password copied to clipboard" });
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {currentRole === "boss" && <TableHead className="w-[70px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaders.map((leader) => (
              <TableRow key={leader.id}>
                <TableCell className="font-medium">{leader.username}</TableCell>
                <TableCell>
                  <Badge variant={leader.role === "boss" ? "default" : "secondary"}>
                    {roleLabel(leader.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(leader.created_at).toLocaleDateString("de-DE")}
                </TableCell>
                {currentRole === "boss" && (
                  <TableCell>
                    {leader.role === "helper" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleTransfer(leader.id, leader.username)}
                          >
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Promote to R5
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(leader.id, leader.username)}
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemove(leader.id, leader.username)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              Temporary password for <strong>{tempPassword?.username}</strong>. Share
              this with them — they should change it after logging in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input readOnly value={tempPassword?.password ?? ""} className="font-mono" />
            <Button variant="outline" size="icon" onClick={copyTempPassword}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
