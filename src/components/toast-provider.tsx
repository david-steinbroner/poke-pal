"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      duration={3000}
      expand={false}
      offset={80}
    />
  );
}
