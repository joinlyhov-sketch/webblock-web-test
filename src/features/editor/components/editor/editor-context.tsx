"use client";

import { createContext, use } from "react";
import type { MediaAsset } from "../../types";

type MediaLibrary = {
  websiteId: string;
  /** The owner's image library, read by the page and handed to the image fields. */
  media: MediaAsset[];
  /** Puts a just-uploaded image at the front of the library. */
  addMedia: (asset: MediaAsset) => void;
};

export const MediaContext = createContext<MediaLibrary>({ websiteId: "", media: [], addMedia: () => {} });

export function useMedia(): MediaLibrary {
  return use(MediaContext);
}
