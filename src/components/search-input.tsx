"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import pokemonData from "@/data/pokemon-search-index.json";

type PokemonOption = {
  id: string;
  name: string;
};

type SearchInputProps = {
  mode?: "navigate" | "select";
  onSelect?: (pokemonId: string) => void;
  placeholder?: string;
};

export function SearchInput({
  mode = "navigate",
  onSelect,
  placeholder = "Who are you fighting?",
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const lower = query.toLowerCase();
    return pokemonData
      .filter(
        (p) => p.name.toLowerCase().includes(lower) || p.id.includes(lower),
      )
      .slice(0, 8)
      .map((p): PokemonOption => ({ id: p.id, name: p.name }));
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
    setIsOpen(results.length > 0);
  }, [results]);

  function selectPokemon(pokemon: PokemonOption) {
    setQuery("");
    setIsOpen(false);
    if (mode === "select" && onSelect) {
      onSelect(pokemon.id);
      // Blur to dismiss keyboard, then scroll back to top after iOS keyboard animation
      inputRef.current?.blur();
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } else {
      router.push(`/counter/${pokemon.id}`);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      selectPokemon(results[selectedIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 150);
          // Scroll back to top after keyboard dismisses (iOS keyboard animation delay)
          if (mode === "select") {
            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 300);
          }
        }}
        className="min-h-14 text-lg"
        autoComplete="off"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border bg-background shadow-sm">
          {results.map((pokemon, index) => (
            <li key={pokemon.id}>
              <button
                className={`w-full min-h-11 px-3 py-2 text-left text-base capitalize hover:bg-muted ${
                  index === selectedIndex ? "bg-muted" : ""
                }`}
                onMouseDown={() => selectPokemon(pokemon)}
              >
                {pokemon.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
