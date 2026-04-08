"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

type CopyButtonProps = {
  searchString: string;
  label: string;
  compact?: boolean; // shorter "Copied!" text when in dual layout
};

export function CopyButton({ searchString, label, compact }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(searchString);
    if (success) {
      setCopied(true);
      if (navigator.vibrate) navigator.vibrate(50);
      toast("Copied — paste in game!");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast("Long-press to copy manually");
    }
  }, [searchString]);

  if (!searchString) return null;

  return (
    <button
      onClick={handleCopy}
      className={`w-full min-h-11 rounded-lg px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
        copied
          ? "bg-green-600 text-white"
          : "bg-primary text-primary-foreground"
      }`}
      style={{ touchAction: "manipulation" }}
    >
      {copied ? (compact ? "Copied!" : "Copied — paste in game!") : label}
    </button>
  );
}
