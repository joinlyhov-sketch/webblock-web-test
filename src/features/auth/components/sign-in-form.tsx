"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/common/toast";
import { withNext } from "@/lib/auth/next-path";
import { EMAIL_MAX } from "@/lib/validation/fields";
import { parseForm, signInInput, type FieldErrors } from "../schemas";
import { Field, FormFooter, OrDivider } from "./field";
import { GoogleButton } from "./google-button";
import { MockRoleButtons } from "./mock-role-buttons";
import { PasswordInput } from "./password-input";

export function SignInForm({ defaultEmail, next = null }: { defaultEmail?: string; next?: string | null }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseForm(signInInput, new FormData(e.currentTarget));
    setErrors(result.ok ? {} : result.fieldErrors);
    if (!result.ok) return;

    // TEMPORARY mock sign-in until the real login exists: any valid email + password signs in,
    // emails starting with "admin@" as ADMIN. The mock route sets the `wb_role` cookie that
    // lib/auth/session.ts reads (the same route the "Enter as …" buttons use).
    // TODO(auth): replace with the real sign-in when the Spring login is connected.
    const role = result.data.email.toLowerCase().startsWith("admin@") ? "ADMIN" : "USER";
    const body = new FormData();
    body.set("role", role);
    setPending(true);
    try {
      const response = await fetch("/api/mock-auth", { method: "POST", body });
      if (!response.ok) throw new Error(`Sign-in failed (${response.status})`);
    } catch {
      setPending(false);
      toast.error("Couldn't sign you in", "Check your connection and try again.");
      return;
    }
    // Back to the page that asked for sign-in (e.g. the template catalogue), else home for the role.
    router.push(next ?? (role === "ADMIN" ? "/admin" : "/websites"));
  }

  return (
    <>
      <GoogleButton label="Continue with Google" />
      <OrDivider />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
        <Field id="email" label="Email" error={errors.email?.[0]}>
          <Input
            size="lg"
            id="email"
            name="email"
            maxLength={EMAIL_MAX}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={defaultEmail}
            aria-invalid={!!errors.email || undefined}
            aria-describedby="email-msg"
          />
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password?.[0]}
          aside={
            <Link href="/forgot-password" className="text-[13px] font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={!!errors.password || undefined}
            aria-describedby="password-msg"
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1 w-full" loading={pending}>
          Sign in
        </Button>
      </form>
      <FormFooter>
        New to WebBlock?{" "}
        <Link href={withNext("/register", next)} className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </FormFooter>
      <MockRoleButtons next={next} />
    </>
  );
}
