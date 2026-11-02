import { TickCircle } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter and one number", test: (p: string) => /[A-Z]/.test(p) && /\d/.test(p) },
  { label: "One symbol (optional)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: "Too weak", bar: "bg-danger", text: "text-danger" },
  { label: "Too weak", bar: "bg-danger", text: "text-danger" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
  { label: "Very strong", bar: "bg-success", text: "text-success" },
];

/** 0–4: one point per rule above, plus one for 12+ characters. Display only; the schema decides. */
function score(password: string) {
  return RULES.filter((r) => r.test(password)).length + (password.length >= 12 ? 1 : 0);
}

/** 4-segment strength bar under a new-password field. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const value = password ? score(password) : 0;
  const level = LEVELS[value];
  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="flex gap-1.5">
        {LEVELS.slice(1).map((_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full", i < value ? level.bar : "bg-border")} />
        ))}
      </div>
      <p className="flex justify-between text-xs text-muted-foreground" aria-live="polite">
        Password strength
        {password && <span className={cn("font-bold", level.text)}>{level.label}</span>}
      </p>
    </div>
  );
}

/** Checklist of the password rules, ticked as they're met. */
export function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn("flex items-center gap-2 text-[13px]", met ? "text-success" : "text-muted-foreground")}
          >
            <TickCircle className="size-[15px]" />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
