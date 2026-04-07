"use client";

import { RetryError } from "@/components/error-states";

export default function Error({ reset }: { reset: () => void }) {
  return <RetryError onRetry={reset} />;
}
