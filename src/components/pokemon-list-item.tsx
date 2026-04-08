"use client";

import { Plus, Check, X, ChevronRight } from "lucide-react";
import { TypeBadge } from "@/components/type-badge";

const TIER_COLORS: Record<string, string> = {
  S: "text-yellow-600 dark:text-yellow-400",
  A: "text-blue-600 dark:text-blue-400",
  B: "text-green-600 dark:text-green-400",
  C: "text-muted-foreground",
};

type PokemonListItemProps = {
  name: string;
  types?: string[];
  tier?: string;
  fastMove?: string;
  chargedMoves?: string[];
  recommended?: boolean;
  action?: "add" | "added" | "remove" | "link";
  onAction?: () => void;
};

export function PokemonListItem({
  name,
  types,
  tier,
  fastMove,
  chargedMoves,
  recommended,
  action,
  onAction,
}: PokemonListItemProps) {
  const ActionIcon = {
    add: Plus,
    added: Check,
    remove: X,
    link: ChevronRight,
  }[action ?? "link"];

  const isDisabled = action === "added";

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      {tier && (
        <span className={`text-sm font-bold shrink-0 ${TIER_COLORS[tier] ?? "text-muted-foreground"}`}>
          {tier}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {/* Name + types on same line */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{name}</span>
          {recommended && (
            <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Rec
            </span>
          )}
          {types && types.length > 0 && (
            <div className="ml-auto flex shrink-0 gap-1">
              {types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          )}
        </div>
        {/* Moves on second line */}
        {(fastMove || chargedMoves) && (
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {fastMove && <span>{fastMove}</span>}
            {fastMove && chargedMoves && chargedMoves.length > 0 && <span className="mx-1">|</span>}
            {chargedMoves && <span>{chargedMoves.join(", ")}</span>}
          </div>
        )}
      </div>
      {action && onAction && (
        <button
          onClick={isDisabled ? undefined : onAction}
          className={`shrink-0 flex items-center justify-center min-h-11 min-w-11 ${
            isDisabled
              ? "text-green-600 pointer-events-none"
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={{ touchAction: "manipulation" }}
          aria-label={`${action} ${name}`}
          aria-disabled={isDisabled}
        >
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
