"use client";

import { useRef, useState, useLayoutEffect, useCallback } from "react";

type FixedHeaderProps = {
  children: React.ReactNode;
};

export function FixedHeader({ children }: FixedHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(80);

  const measure = useCallback(() => {
    if (headerRef.current) {
      const h = headerRef.current.offsetHeight;
      setHeight(h);
      // Publish for descendants (e.g. sticky section headers) to offset below us.
      document.documentElement.style.setProperty("--fixed-header-h", `${h}px`);
    }
  }, []);

  // useLayoutEffect runs before paint — prevents visible jump
  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <>
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-40 border-b bg-background">
        <div className="mx-auto max-w-lg px-4 pb-2 pt-3">
          {children}
        </div>
      </div>
      <div style={{ height }} />
    </>
  );
}
