"use client";

import { useActionState } from "react";
import { submitPower } from "@/lib/actions/submissions";
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
import { formatPower } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface SubmissionFormProps {
  token: string;
  playerName: string;
  latestEntry: {
    squad1: number;
    squad2: number;
    squad3: number;
    squad4: number;
  } | null;
}

export function SubmissionForm({
  token,
  playerName,
  latestEntry,
}: SubmissionFormProps) {
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean; total?: number } | undefined,
      formData: FormData
    ) => {
      return await submitPower(token, formData);
    },
    undefined
  );

  if (state?.success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Submitted!</CardTitle>
          <CardDescription>
            Your squad power has been recorded successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-2xl font-bold">{formatPower(state.total ?? 0)}</p>
          <p className="text-sm text-muted-foreground">Total Power</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Submit Squad Power</CardTitle>
        <CardDescription>
          Hi {playerName}! Enter your current squad power levels below.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="space-y-2">
              <Label htmlFor={`squad${num}`}>
                Squad {num}{num === 4 ? " (optional)" : ""}
              </Label>
              <Input
                id={`squad${num}`}
                name={`squad${num}`}
                type="text"
                inputMode="numeric"
                placeholder={num === 4 ? "0" : ""}
                defaultValue={
                  latestEntry
                    ? formatPower(latestEntry[`squad${num}` as keyof typeof latestEntry])
                    : num === 4 ? "" : "0"
                }
                required={num !== 4}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Submitting..." : "Submit Power"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
