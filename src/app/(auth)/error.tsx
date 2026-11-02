"use client";

import { ErrorState } from "@/components/common/error-state";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <ErrorState error={error} retry={retry} />
    </main>
  );
}
