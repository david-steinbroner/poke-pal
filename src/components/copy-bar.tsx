"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

export function CopyBar({ searchString }: { searchString: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(searchString);
    if (success) {
      setCopied(true);
      if (navigator.vibrate) navigator.vibrate(50);
      toast("Copied! Paste in Pokemon GO");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast("Long-press the text to copy manually");
    }
  }, [searchString]);

  if (!searchString) return null;

  return (
    <div className="relative flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
      <code className="flex-1 select-all break-all text-sm font-mono">
        {searchString}
      </code>
      <button
        onClick={handleCopy}
        className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-95 active:opacity-70 ${
          copied
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        }`}
        style={{ touchAction: "manipulation" }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
