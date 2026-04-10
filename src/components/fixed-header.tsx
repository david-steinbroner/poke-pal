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
      setHeight(headerRef.current.offsetHeight);
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
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-40 bg-background">
        <div className="mx-auto max-w-lg px-4 pb-2 pt-3">
          {children}
        </div>
      </div>
      {/* Fade gradient — visual only, below header */}
      <div className="fixed left-0 right-0 z-20 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none" style={{ top: height }} />
      <div style={{ height }} />
    </>
  );
}
