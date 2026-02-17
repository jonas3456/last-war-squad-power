"use client";

import { useActionState } from "react";
import { selfRegisterPlayer } from "@/lib/actions/players";
import { getBaseUrl } from "@/lib/utils";
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
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function RegisterForm({
  inviteToken,
  allianceName,
}: {
  inviteToken: string;
  allianceName: string;
}) {
  const baseUrl = getBaseUrl();

  const [state, formAction, pending] = useActionState(
    async (
      _prev:
        | { error?: string; success?: boolean; token?: string; existingPlayer?: boolean }
        | undefined,
      formData: FormData
    ) => {
      return await selfRegisterPlayer(inviteToken, formData);
    },
    undefined
  );

  if (state?.success && state.token) {
    const submitUrl = `${baseUrl}/submit/${state.token}`;

    function copyLink() {
      navigator.clipboard.writeText(submitUrl);
      toast({ title: "Link copied to clipboard" });
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>
            {state.existingPlayer ? "Welcome back!" : "Registered!"}
          </CardTitle>
          <CardDescription>
            {state.existingPlayer
              ? "Here's your existing submission link."
              : "You're all set. Bookmark this link to submit your squad power."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input readOnly value={submitUrl} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button className="w-full" asChild>
            <a href={submitUrl}>Go to Submission Page</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join {allianceName}</CardTitle>
        <CardDescription>
          Enter your player name to register and get your personal submission
          link.
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
            <Label htmlFor="name">Player Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your in-game name"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Registering..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
