"use client";

import { useActionState } from "react";
import { joinAlliance } from "@/lib/actions/join";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function JoinForm({
  inviteToken,
  allianceName,
}: {
  inviteToken: string;
  allianceName: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await joinAlliance(inviteToken, formData);
    },
    undefined
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join Alliance</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{allianceName}</strong> as an R4 leader.
          Create your account to get started.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="your-username"
              minLength={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Joining..." : "Join Alliance"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
