import { TYPE_COLORS } from "@/lib/constants";

type TypeBadgeProps = {
  type: string;
  variant?: "default" | "muted";
};

export function TypeBadge({ type, variant = "default" }: TypeBadgeProps) {
  const variantClasses =
    variant === "muted"
      ? "bg-muted text-muted-foreground"
      : `text-white ${TYPE_COLORS[type] ?? "bg-gray-500"}`;

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses}`}
    >
      {type}
    </span>
  );
}
