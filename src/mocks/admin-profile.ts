import type { AdminProfile } from "@/features/admin/types";
import { at } from "./time";

export const adminProfile: AdminProfile = {
  id: "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51",
  accountCode: "ADM-000001",
  fullName: "Uy Chakriya",
  email: "admin@webblock.com",
  avatarUrl: "/mock/avatars/chakriya-uy.jpg",
  title: "WebBlock Admin",
  joinedAt: at("2026-01-12T02:00:00Z"),
};
