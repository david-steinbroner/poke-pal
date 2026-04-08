"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={handleBack}
      className="text-sm text-muted-foreground hover:text-foreground active:opacity-70"
    >
      &larr; Back
    </button>
  );
}
