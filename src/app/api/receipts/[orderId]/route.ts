// Settings → Billing "Receipt": sends the receipt file of one of the signed-in user's paid orders.
// With Spring this route can stream the backend's receipt response the same way.
import { getOrderReceipt } from "@/features/account";
import { ApiError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireUser();
  try {
    const file = await getOrderReceipt(user.id, orderId);
    return new Response(Buffer.from(file.bytes), {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return new Response(e.message, { status: e.status });
    throw e;
  }
}
