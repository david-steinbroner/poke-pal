"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
      aria-label="Back"
      className="-ml-1 inline-flex min-h-11 min-w-11 items-center justify-start text-muted-foreground hover:text-foreground active:opacity-70 transition-opacity"
    >
      <ArrowLeft className="size-6" />
    </button>
  );
}
