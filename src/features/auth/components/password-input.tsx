"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeSlash } from "iconsax-reactjs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PASSWORD_MAX } from "@/lib/validation/fields";

/** Password field with a show/hide toggle. `trailing` replaces the toggle (e.g. a "matches" tick). */
export function PasswordInput({
  trailing,
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "type"> & { trailing?: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        size="lg"
        maxLength={PASSWORD_MAX}
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-11 tracking-wide placeholder-shown:tracking-normal", className)}
      />
      <span className="absolute inset-y-0 right-3.5 flex items-center">
        {trailing ?? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="rounded text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            {visible ? <EyeSlash variant="Outline" className="size-[17px]" /> : <Eye variant="Outline" className="size-[17px]" />}
          </button>
        )}
      </span>
    </div>
  );
}
