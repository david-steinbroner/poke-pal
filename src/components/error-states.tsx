"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function RetryError({
  message = "Something went wrong. Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={onRetry} className="min-h-11">
        Retry
      </Button>
    </div>
  );
}

export function GoBackError({
  message = "Page not found.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Go Back
      </Link>
    </div>
  );
}
