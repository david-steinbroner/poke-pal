"use client";

import { useState, useCallback } from "react";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

type CopyFabProps = {
  searchString: string;
  label?: string;
  secondarySearchString?: string;
  secondaryLabel?: string;
};

export function CopyFab({
  searchString,
  label = "Copy",
  secondarySearchString,
  secondaryLabel,
}: CopyFabProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = useCallback(async (str: string, which: string) => {
    await copyToClipboard(str);
    if (navigator.vibrate) navigator.vibrate(50);
    setCopied(which);
    setShowMenu(false);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const hasTwoOptions = secondarySearchString && secondaryLabel;

  if (!searchString) return null;

  return (
    <>
      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+56px)] right-4 z-50 flex flex-col items-stretch" style={{ minWidth: 180 }}>
        {/* Menu options */}
        {showMenu && hasTwoOptions && (
          <div className="mb-2 flex flex-col gap-1.5">
            <button
              onClick={() => handleCopy(searchString, "primary")}
              className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg active:scale-95 transition-transform"
            >
              <CopyIcon />
              {label}
            </button>
            <button
              onClick={() => handleCopy(secondarySearchString, "secondary")}
              className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg active:scale-95 transition-transform"
            >
              <CopyIcon />
              {secondaryLabel}
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => {
            if (hasTwoOptions) {
              setShowMenu(!showMenu);
            } else {
              handleCopy(searchString, "primary");
            }
          }}
          className={`flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold shadow-lg active:scale-95 transition-all ${
            copied
              ? "bg-green-600 text-white"
              : "bg-primary text-primary-foreground"
          }`}
        >
          <CopyIcon />
          {copied ? "Copied!" : hasTwoOptions ? "Copy" : label}
        </button>
      </div>
    </>
  );
}

function CopyIcon() {
  return (
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
  );
}
