"use client";

import { useActionState, useEffect, useRef } from "react";
import { Lock1 } from "iconsax-reactjs";
import { setPasswordAction } from "../actions";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, SETTINGS_FIELD, SettingsCard } from "./settings-card";

/** "Set a password" for Google-only accounts, "Password" (with the current one) once one exists. */
export function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(setPasswordAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Password saved");
      formRef.current?.reset();
    } else {
      toast.error("Could not save the password", state.message);
    }
  }, [state]);

  const error = (field: string) => (state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined);
  const gap = "gap-[7px]";

  return (
    <SettingsCard
      icon={<Lock1 variant="Outline" />}
      title={hasPassword ? "Password" : "Set a password"}
      description={
        hasPassword
          ? "Use at least 8 characters."
          : "You sign in with Google. Add a password (at least 8 characters) to also sign in with your email."
      }
    >
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        {hasPassword && (
          <Field id="currentPassword" label="Current password" error={error("currentPassword")} className={gap}>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your current password"
              aria-invalid={!!error("currentPassword")}
              aria-describedby={error("currentPassword") ? "currentPassword-hint" : undefined}
              className={SETTINGS_FIELD}
            />
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="password" label="New password" error={error("password")} className={gap}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter a new password"
              aria-invalid={!!error("password")}
              aria-describedby={error("password") ? "password-hint" : undefined}
              className={SETTINGS_FIELD}
            />
          </Field>
          <Field
            id="confirmPassword"
            label={hasPassword ? "Confirm new password" : "Confirm password"}
            error={error("confirmPassword")}
            className={gap}
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter the password"
              aria-invalid={!!error("confirmPassword")}
              aria-describedby={error("confirmPassword") ? "confirmPassword-hint" : undefined}
              className={SETTINGS_FIELD}
            />
          </Field>
        </div>
        <div className="flex items-center justify-end">
          <Button type="submit" loading={pending}>
            {hasPassword ? "Change password" : "Set password"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
