import { requireUser } from "@/lib/auth/session";
import { getSupportView, SupportView } from "@/features/support";

export const metadata = { title: "Contact Support" };

export default async function SupportPage() {
  const user = await requireUser();
  const data = await getSupportView(user.id);

  return <SupportView data={data} />;
}
