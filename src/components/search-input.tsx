"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

type SearchOption = {
  id: string;
  name: string;
};

export function SearchInput({
  options,
  onSelect,
  placeholder = "Search a Pokemon...",
}: {
  options: SearchOption[];
  onSelect: (id: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return options
      .filter((o) => o.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, options]);

  function handleSelect(id: string) {
    setQuery("");
    setOpen(false);
    onSelect(id);
  }

  return (
    <div className="relative">
      <Input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="min-h-11"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute top-full z-30 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
          {filtered.map((option) => (
            <li key={option.id}>
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => handleSelect(option.id)}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
