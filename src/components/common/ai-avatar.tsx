import Image from "next/image";
import { cn } from "@/lib/utils";

/** WebBlock AI's profile picture: the robot mascot on its round blue tile. Same everywhere the AI appears. */
export function AiAvatar({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="WebBlock AI" className={cn("relative size-8 shrink-0 overflow-hidden rounded-full", className)}>
      <Image src="/images/ai-avatar.png" alt="" fill sizes="48px" className="object-cover" />
    </span>
  );
}
