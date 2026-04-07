"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return <Toaster position="top-center" duration={3000} />;
}
