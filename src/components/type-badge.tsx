import { TYPE_COLORS } from "@/lib/constants";

export function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[type] ?? "bg-gray-500"}`}
    >
      {type}
    </span>
  );
}
