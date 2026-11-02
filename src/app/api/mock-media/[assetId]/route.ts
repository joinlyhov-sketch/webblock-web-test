// Mock only: serves images uploaded in the editor. Public, like a storage URL, so live sites can show them.
// With Spring, uploaded image URLs point at storage and this route is deleted.
import { getMediaFile } from "@/features/editor";
import { ApiError } from "@/lib/api/errors";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  try {
    const file = await getMediaFile(assetId);
    return new Response(Buffer.from(file.bytes), {
      headers: { "Content-Type": file.type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch (e) {
    if (e instanceof ApiError) return new Response("Not found", { status: e.status });
    throw e;
  }
}
