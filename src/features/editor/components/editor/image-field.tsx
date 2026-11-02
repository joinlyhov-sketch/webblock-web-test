"use client";

import { useState } from "react";
import Image from "next/image";
import { Export, Gallery, Trash } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
import { UploadImageModal } from "@/components/common/upload-image-modal";
import { Button } from "@/components/ui/button";
import { SITE_IMAGE_RULE } from "@/lib/image-rules";
import { uploadMediaAction } from "../../actions";
import { useMedia } from "./editor-context";

/**
 * Figma "Content · Image": thumbnail + file name, "Upload image" (a file from the owner's computer)
 * and remove. One way to change an image, so there is no separate "Replace image" library picker.
 * Used as a Puck custom field, so it also works inside product rows.
 */
export function ImageField({
  value,
  onChange,
  readOnly,
}: {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  readOnly?: boolean;
}) {
  const { websiteId, media, addMedia } = useMedia();
  const [uploading, setUploading] = useState(false);
  // Uploaded images live at /api/mock-media/<id>, so show the original file name from the library.
  const name = media.find((asset) => asset.url === value)?.name ?? value?.split("/").pop() ?? "No image";

  async function upload(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.set("image", file);
    const result = await uploadMediaAction(websiteId, formData);
    if (!result.ok) {
      toast.error("Couldn't upload image", result.message);
      return false;
    }
    addMedia(result.data);
    onChange(result.data.url);
    return true;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-[84px] shrink-0 overflow-hidden rounded-xl bg-primary-soft">
          {value ? (
            <Image src={value} alt="" fill sizes="84px" className="object-cover" />
          ) : (
            <Gallery aria-hidden className="absolute inset-0 m-auto size-6 text-placeholder" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{value ? "Shown at 4:3" : "A placeholder is shown"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="flex-1" disabled={readOnly} onClick={() => setUploading(true)}>
          <Export /> Upload image
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Remove image"
          disabled={readOnly || !value}
          onClick={() => onChange(null)}
        >
          <Trash />
        </Button>
      </div>

      <UploadImageModal open={uploading} onClose={() => setUploading(false)} rule={SITE_IMAGE_RULE} onUpload={upload} />
    </div>
  );
}
