"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchResult {
  symbol: string;
  name?: string;
  exchange?: string;
  asset_type?: string;
}

interface StockSearchProps {
  compact?: boolean;
}

export function StockSearch({ compact = false }: StockSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch search results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();

    async function fetchResults() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/stocks/search?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(data.length > 0);
          setActiveIndex(-1);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
    return () => controller.abort();
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToStock = useCallback(
    (symbol: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(`/stocks/${symbol}`);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        navigateToStock(query.trim().toUpperCase());
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          navigateToStock(results[activeIndex].symbol);
        } else if (query.trim()) {
          navigateToStock(query.trim().toUpperCase());
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className={cn("relative w-full mx-auto", compact ? "max-w-lg" : "max-w-2xl")}>
      {/* Search input */}
      <div className="relative group">
        {!compact && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-teal-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
        )}
        <div className="relative flex items-center">
          <Search className={cn(
            "absolute text-zinc-400 dark:text-zinc-500 pointer-events-none",
            compact ? "left-3 w-4 h-4" : "left-4 w-5 h-5"
          )} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={compact ? "Search stocks..." : "Search stocks by name or symbol..."}
            className={cn(
              "w-full border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-emerald-500/50 dark:focus:border-emerald-500/40 transition-all duration-300",
              compact
                ? "h-10 pl-9 pr-9 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/5"
                : "h-14 pl-12 pr-12 rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/5"
            )}
            autoComplete="off"
          />
          {isLoading ? (
            <Loader2 className={cn(
              "absolute text-zinc-400 animate-spin",
              compact ? "right-3 w-4 h-4" : "right-4 w-5 h-5"
            )} />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className={cn(
                "absolute p-0.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors",
                compact ? "right-3" : "right-4"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden z-50"
        >
          <div className="p-1.5 max-h-[360px] overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.symbol}
                type="button"
                onClick={() => navigateToStock(result.symbol)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  activeIndex === index
                    ? "bg-emerald-500/10 dark:bg-emerald-500/10"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                    {result.symbol.slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                      {result.symbol}
                    </span>
                    {result.exchange && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {result.exchange}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {result.name || "—"}
                  </p>
                </div>
                {result.asset_type && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                    {result.asset_type}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
