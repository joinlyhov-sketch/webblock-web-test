// Public contact form. A Route Handler, not a Server Action, because landing-page visitors are not
// signed in, so there is no user to require(). Mock now; Spring's public `POST /contact` later.
import { NextResponse, type NextRequest } from "next/server";
import { submitContact } from "@/features/landing";

export async function POST(request: NextRequest) {
  // A body that isn't a form (e.g. JSON) is a bad request, not a server error.
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, message: "Send the form as form data." }, { status: 400 });
  const result = await submitContact(form);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
