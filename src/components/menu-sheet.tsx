"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const FEEDBACK_URL = "https://forms.gle/PLACEHOLDER";

export function MenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Poke Pal</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">v0.1.0</p>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm underline"
          >
            Send Feedback
          </a>
          <div className="text-xs text-muted-foreground">
            <p>
              Not affiliated with Niantic, The Pokemon Company, or Nintendo.
            </p>
            <p className="mt-1">Built by David Steinbroner</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
