import Image from "next/image";
import { Gallery } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * A website photo that fills its parent (give the parent a size or aspect ratio and `relative`).
 * `src` null → a neutral placeholder, so a removed image never breaks the layout.
 */
export function SiteImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string | null;
  alt: string;
  /** e.g. "(min-width: 1024px) 25vw, 50vw" */
  sizes: string;
  className?: string;
  /** Above the fold (hero): load right away. */
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt || "No image"}
        className={cn("absolute inset-0 flex items-center justify-center bg-site-alt text-site-subtle", className)}
      >
        <Gallery variant="Outline" aria-hidden className="size-8" />
      </div>
    );
  }
  // Next 16 deprecated `priority`: above-the-fold photos load eagerly with high fetch priority instead.
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      className={cn("object-cover", className)}
    />
  );
}
