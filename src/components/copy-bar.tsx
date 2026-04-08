"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

export function CopyBar({ searchString, label }: { searchString: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(searchString);
    if (success) {
      setCopied(true);
      if (navigator.vibrate) navigator.vibrate(50);
      toast("Copied! Paste in Pokemon GO");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast("Long-press the text to copy manually");
    }
  }, [searchString]);

  if (!searchString) return null;

  return (
    <div>
      {label && <p className="mb-1 text-xs text-muted-foreground">{label}</p>}
      <div className="relative flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] p-3">
        <code className="flex-1 truncate text-sm font-mono">
          {searchString}
        </code>
        <button
          onClick={handleCopy}
          className={`shrink-0 rounded-lg px-4 py-2.5 text-base font-medium transition-all active:scale-95 active:opacity-70 ${
            copied
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground"
          }`}
          style={{ touchAction: "manipulation" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
