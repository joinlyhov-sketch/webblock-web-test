"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TickCircle } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { withNext } from "@/lib/auth/next-path";
import { newPasswordInput, parseForm, type FieldErrors } from "../schemas";
import { Field } from "./field";
import { PasswordInput } from "./password-input";
import { PasswordRules, PasswordStrengthMeter } from "./password-strength";

/** Register step 3 ("Create a password") and forgot-password step 3 ("Set a new password"). */
export function NewPasswordForm({
  email,
  mode,
  next = null,
}: {
  email: string;
  mode: "create" | "reset";
  /** Where to go after signing in; passed on to the sign-in page. */
  next?: string | null;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const isReset = mode === "reset";
  const matches = confirm.length > 0 && confirm === password;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseForm(newPasswordInput, new FormData(e.currentTarget));
    if (!result.ok) return setErrors(result.fieldErrors);
    setErrors({});
    // TODO(auth): call the create-account / reset-password action, then go to sign-in.
    router.push(withNext(`/sign-in?email=${encodeURIComponent(email)}`, next));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
      <input type="hidden" name="email" value={email} />
      <Field id="password" label={isReset ? "New password" : "Password"} error={errors.password?.[0]}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password || undefined}
          aria-describedby="password-msg"
        />
      </Field>
      <PasswordStrengthMeter password={password} />
      <PasswordRules password={password} />
      <Field
        id="confirmPassword"
        label={isReset ? "Confirm new password" : "Confirm password"}
        error={errors.confirmPassword?.[0]}
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={!!errors.confirmPassword || undefined}
          aria-describedby="confirmPassword-msg"
          trailing={matches ? <TickCircle variant="Outline" aria-label="Passwords match" className="size-[17px] text-success" /> : undefined}
        />
      </Field>
      <Button type="submit" size="lg" className="w-full">
        {isReset ? "Update password" : "Create account"}
      </Button>
      <p className="text-center text-[13px] text-muted-foreground">Next, you’ll sign in with your new password.</p>
    </form>
  );
}
