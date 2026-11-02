"use client";

import { ErrorState } from "@/components/common/error-state";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="p-page">
      <ErrorState error={error} retry={retry} />
    </main>
  );
}
