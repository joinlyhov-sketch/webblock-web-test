import type { SessionUser } from "@/lib/auth/roles";

/** The demo owner (USER role): his id is the same in the owner screens and in the admin data. */
export const SOVANNARITH_ID = "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90";

export const sessionUsers: SessionUser[] = [
  {
    id: SOVANNARITH_ID,
    email: "sovannarith@gmail.com",
    fullName: "Sovannarith Soeun",
    role: "USER",
    avatarUrl: "/mock/avatars/sovannarith-soeun.jpg",
  },
  {
    id: "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51",
    email: "admin@webblock.com",
    fullName: "Uy Chakriya",
    role: "ADMIN",
    avatarUrl: "/mock/avatars/chakriya-uy.jpg",
  },
];

export const PETAL_AND_STEM_ID = "7d3e9b2a-1c4f-4a8e-b6d5-3f2e1a9c8b70";
export const MAPLE_AND_RYE_ID = "b4f1c8d2-6e3a-4b9f-a2d7-1c5e8f0b3a64";
export const LANTERN_CAFE_ID = "2a9c5e71-8d36-4c0b-b1f4-6e7d3a2c9f08";
export const NORTHPOINT_AUDIO_ID = "9e1b4d63-2f7a-4d85-8c30-a5b6c7d8e9f1";

type WebsiteOwner = { websiteId: string; ownerId: string };

const ownerSeed: WebsiteOwner[] = [
  PETAL_AND_STEM_ID,
  MAPLE_AND_RYE_ID,
  LANTERN_CAFE_ID,
  NORTHPOINT_AUDIO_ID,
].map((websiteId) => ({
  websiteId,
  ownerId: SOVANNARITH_ID,
}));

/**
 * Which user owns which website. Kept on globalThis so dev hot reloads do not drop
 * websites created while the server is running.
 */
const globalForOwners = globalThis as typeof globalThis & {
  __wbWebsiteOwners?: WebsiteOwner[];
};
export const websiteOwners: WebsiteOwner[] = (globalForOwners.__wbWebsiteOwners ??= ownerSeed);
