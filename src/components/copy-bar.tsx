"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyBar({ searchString }: { searchString: string }) {
  const [copied, setCopied] = useState(false);

  if (!searchString) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(searchString);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Try selecting the text manually.");
    }
  }

  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
      <code className="flex-1 truncate text-sm font-mono text-foreground">
        {searchString}
      </code>
      <Button
        onClick={handleCopy}
        size="sm"
        variant={copied ? "secondary" : "default"}
        className="shrink-0"
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
