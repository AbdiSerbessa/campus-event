"use client";

import ErrorMessage from "@/components/ErrorMessage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorMessage title="Something went wrong" message={error.message || "An unexpected error occurred."}>
      <button type="button" className="btn btn-outline" onClick={reset}>
        Try again
      </button>
    </ErrorMessage>
  );
}
