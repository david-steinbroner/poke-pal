"use client";

export function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      style={{ touchAction: "manipulation" }}
    >
      Clear
    </button>
  );
}
