"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { signOut } from "./service";

export async function signOutAction(): Promise<void> {
  await requireUser();
  await signOut();
  redirect("/sign-in");
}
