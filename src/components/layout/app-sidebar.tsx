import { requireUser } from "@/lib/auth/session";
import { getSidebarView } from "@/features/account";
import { AppSidebarShell } from "./app-sidebar-shell";

/** User sidebar. Loads the plan summary and profile on the server, the shell handles clicks. */
export async function AppSidebar() {
  const user = await requireUser();
  const { profile, summary } = await getSidebarView(user.id);
  return <AppSidebarShell profile={profile} summary={summary} />;
}
