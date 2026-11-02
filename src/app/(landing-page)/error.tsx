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
    <div className="mx-auto max-w-[1280px] px-4 pt-32 pb-16 sm:px-6">
      <ErrorState error={error} retry={retry} />
    </div>
  );
}
