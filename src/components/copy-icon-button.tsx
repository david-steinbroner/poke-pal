"use client";

import { useState, useCallback } from "react";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

type CopyIconButtonProps = {
  label: string;
  searchString: string;
  onCopy?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export function CopyIconButton({
  label,
  searchString,
  onCopy,
  disabled,
  variant = "primary",
}: CopyIconButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleClick = useCallback(async () => {
    if (disabled) return;
    await copyToClipboard(searchString);
    if (onCopy) onCopy();
    setCopied(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setCopied(false), 3000);
  }, [searchString, onCopy, disabled]);

  const baseClass =
    "flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]";

  const variantClass = copied
    ? "bg-green-600 text-white"
    : disabled
      ? "bg-primary/30 text-primary-foreground/50 cursor-not-allowed"
      : variant === "secondary"
        ? "border bg-background text-foreground"
        : "bg-primary text-primary-foreground";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass}`}
    >
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      {copied ? "Copied!" : label}
    </button>
  );
}
