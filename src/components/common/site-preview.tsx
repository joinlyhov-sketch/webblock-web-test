import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Screenshot-style thumbnail of a website or template (3:2). `children` float over the top-right corner. */
export function SitePreview({
  src,
  alt,
  className,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative aspect-[3/2] overflow-hidden rounded-xl border border-border bg-surface", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="(min-width: 1024px) 25vw, 100vw"
        className="object-cover object-top"
      />
      {children && <div className="absolute top-2 right-2">{children}</div>}
    </div>
  );
}
