type StatusPillProps = {
  children: React.ReactNode;
  variant?: "green" | "emerald" | "rating";
  className?: string;
};

export function StatusPill({
  children,
  variant = "green",
  className,
}: StatusPillProps) {
  const colors = {
    green:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    rating: "", // caller passes custom colors via className
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
