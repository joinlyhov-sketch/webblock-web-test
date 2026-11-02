import { redirect } from "next/navigation";

/** /admin/monitoring has no page of its own: open the first monitoring screen. */
export default function AdminMonitoringPage() {
  redirect("/admin/monitoring/pipeline");
}
