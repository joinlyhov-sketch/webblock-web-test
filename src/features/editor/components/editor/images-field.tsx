"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Add, Export } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { SITE_IMAGE_RULE, checkImage } from "@/lib/image-rules";
import { uploadMediaAction } from "../../actions";
import { useMedia } from "./editor-context";

type Photo = { imageUrl: string | null; label?: string };

/**
 * Several photos in one field (hero "Side photos"): pick up to `max` files at once, see them as a
 * row of thumbnails, remove any one. Replaces a list of single-image rows so nobody has to add
 * and upload each photo separately. Used as a Puck custom field.
 */
export function ImagesField({
  value,
  onChange,
  readOnly,
  max,
}: {
  id?: string;
  value: Photo[] | undefined;
  onChange: (value: Photo[]) => void;
  readOnly?: boolean;
  max: number;
}) {
  const { websiteId, addMedia } = useMedia();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const photos = value ?? [];
  const room = max - photos.length;

  async function addFiles(files: File[]) {
    const picked = files.slice(0, room);
    if (files.length > room) toast.warning("Too many photos", `Only ${max} photos fit here.`);
    setBusy(true);
    const added: Photo[] = [];
    for (const file of picked) {
      const problem = checkImage(file, SITE_IMAGE_RULE);
      if (problem) {
        toast.error(`Couldn't upload ${file.name}`, problem);
        continue;
      }
      const formData = new FormData();
      formData.set("image", file);
      const result = await uploadMediaAction(websiteId, formData);
      if (!result.ok) {
        toast.error(`Couldn't upload ${file.name}`, result.message);
        continue;
      }
      addMedia(result.data);
      added.push({ imageUrl: result.data.url });
    }
    setBusy(false);
    if (added.length) onChange([...photos, ...added]);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {photos.length > 0 && (
        <ul className="grid grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <li key={`${photo.imageUrl}-${index}`} className="relative aspect-square overflow-hidden rounded-xl bg-primary-soft">
              {photo.imageUrl && <Image src={photo.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              <button
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                disabled={readOnly}
                onClick={() => onChange(photos.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-button outline-none transition-colors hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <Add variant="Outline" aria-hidden className="size-3.5 rotate-45" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="secondary"
        size="sm"
        disabled={readOnly || room <= 0}
        loading={busy}
        onClick={() => inputRef.current?.click()}
      >
        <Export variant="Outline" /> {photos.length ? "Add photos" : "Upload photos"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Choose up to {max} at once · {photos.length} / {max} used
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={SITE_IMAGE_RULE.types.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose photos"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) void addFiles(files);
        }}
      />
    </div>
  );
}
