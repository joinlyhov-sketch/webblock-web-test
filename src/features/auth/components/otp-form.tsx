"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, InfoCircle } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/common/toast";
import { withNext } from "@/lib/auth/next-path";
import { otpInput, parseForm, type FieldErrors } from "../schemas";
import { OtpInput } from "./otp-input";

/** Display only — the backend owns the real expiry and will send it with the "code sent" response. */
const CODE_LIFETIME_SECONDS = 5 * 60;

/** Enter the 6-digit code (register step 2 and forgot-password step 2). */
export function OtpForm({
  email,
  submitLabel,
  nextHref,
  changeEmailHref,
  next = null,
}: {
  email: string;
  submitLabel: string;
  nextHref: string;
  changeEmailHref: string;
  /** Where to go after signing in; passed on to the next step. */
  next?: string | null;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const secondsLeft = useCountdown(CODE_LIFETIME_SECONDS);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseForm(otpInput, new FormData(e.currentTarget));
    if (!result.ok) return setErrors(result.fieldErrors);
    setErrors({});
    // TODO(auth): call the verify-code action; the backend checks the code, attempts and expiry.
    router.push(withNext(`${nextHref}?email=${encodeURIComponent(email)}`, next));
  }

  const expired = secondsLeft === 0;
  const error = errors.code?.[0];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
      <input type="hidden" name="email" value={email} />
      <OtpInput name="code" invalid={!!error} describedBy="code-msg" />
      {error && (
        <p id="code-msg" className="-mt-2.5 text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between text-[13px]">
        <p className="flex items-center gap-1.5 text-muted-foreground" aria-live="polite">
          <Clock variant="Outline" className="size-3.5" />
          {expired ? (
            <span className="text-danger">Code expired</span>
          ) : (
            <>
              Code expires in <b className="font-bold text-foreground tabular-nums">{formatSeconds(secondsLeft)}</b>
            </>
          )}
        </p>
        {/* TODO(auth): call the resend-code action; the backend rate-limits resends. */}
        <button
          type="button"
          onClick={() => toast.warning("Not available yet", "Resending codes will work once the backend is connected.")}
          className="rounded font-semibold text-primary hover:underline"
        >
          Resend code
        </button>
      </div>
      <Button type="submit" size="lg" className="w-full">
        {submitLabel}
      </Button>
      <p className="flex items-center gap-2.5 rounded-[14px] border border-border bg-muted px-3.5 py-3 text-[13px] text-muted-foreground">
        <InfoCircle variant="Outline" className="size-[18px] shrink-0" />
        <span>
          Can’t find it? Check your spam folder or{" "}
          <Link href={changeEmailHref} className="font-semibold text-primary hover:underline">
            change email
          </Link>
          .
        </span>
      </p>
    </form>
  );
}

function useCountdown(from: number) {
  const [seconds, setSeconds] = useState(from);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);
  return seconds;
}

function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
