"use client";

import { useActionState, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useTheme } from "next-themes";
import { signUp } from "@/lib/actions/auth";
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
import Link from "next/link";

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

export function SignupForm() {
  const { resolvedTheme } = useTheme();
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await signUp(formData);
      if (result?.error) {
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      }
      return result;
    },
    undefined
  );

  const captchaRequired = !!SITEKEY;
  const canSubmit = !captchaRequired || !!captchaToken;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Alliance</CardTitle>
        <CardDescription>
          Set up your alliance and start tracking squad power
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
            <Label htmlFor="allianceName">Alliance Name</Label>
            <Input
              id="allianceName"
              name="allianceName"
              placeholder="My Alliance"
              required
            />
          </div>
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
          {SITEKEY && (
            <>
              <HCaptcha
                ref={captchaRef}
                sitekey={SITEKEY}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
              />
              <input type="hidden" name="captchaToken" value={captchaToken ?? ""} />
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending || !canSubmit}>
            {pending ? "Creating alliance..." : "Create Alliance"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
