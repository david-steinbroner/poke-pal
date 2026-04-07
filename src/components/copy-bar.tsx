"use client";

import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyBar({ searchString }: { searchString: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(searchString);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setCopied(true);
      toast("Copied! Switch to Pokemon GO and paste");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Tap and hold the text to copy manually");
    }
  }, [searchString]);

  // Auto-copy on mount
  useEffect(() => {
    if (searchString) {
      copyToClipboard();
    }
  }, [searchString, copyToClipboard]);

  if (!searchString) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
      <code className="flex-1 select-all break-all text-sm font-mono">
        {searchString}
      </code>
      <Button
        onClick={copyToClipboard}
        size="sm"
        variant={copied ? "secondary" : "default"}
        className="min-h-11 min-w-11 shrink-0"
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
