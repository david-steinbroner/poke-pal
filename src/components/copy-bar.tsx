"use client";

import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";

export function CopyBar({ searchString }: { searchString: string }) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const markCopied = useCallback(() => {
    setCopied(true);
    if (navigator.vibrate) navigator.vibrate(50);
    toast("Copied! Paste in Pokemon GO");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!searchString) return null;

  function handleCopy() {
    // Method 1: textarea select + execCommand (works on iOS HTTP)
    const textarea = textRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(0, textarea.value.length);
      if (document.execCommand("copy")) {
        markCopied();
        textarea.blur();
        return;
      }
    }

    // Method 2: clipboard API (HTTPS only)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(searchString).then(markCopied, () => {
        toast("Long-press the text to copy manually");
      });
      return;
    }

    toast("Long-press the text to copy manually");
  }

  return (
    <div className="relative flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
      {/* iOS requires textarea to be "visible" for execCommand copy.
          Positioned inside the container but clipped visually. */}
      <textarea
        ref={textRef}
        readOnly
        value={searchString}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
          fontSize: "16px",
        }}
        tabIndex={-1}
      />
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
