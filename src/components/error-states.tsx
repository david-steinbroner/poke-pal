"use client";

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
      <Button className="min-h-11" render={<a href="/" />}>
        Go Back
      </Button>
    </div>
  );
}

export function OfflineError() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-muted-foreground">
        You appear to be offline. Check your connection and try again.
      </p>
      <Button onClick={() => window.location.reload()} className="min-h-11">
        Retry
      </Button>
    </div>
  );
}
