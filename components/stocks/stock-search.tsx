"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { AddToWatchlistMenu } from "@/components/watchlists/add-to-watchlist-menu";
import { StockLogo } from "./stock-logo";

interface SearchResult {
  symbol: string;
  name?: string;
  exchange?: string;
  asset_type?: string;
  logo_url?: string;
  domain_url?: string;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const overlayContentRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Track client-side mount for portal rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Close dropdown on outside click (non-compact mode only)
  useEffect(() => {
    if (compact) return;

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
  }, [compact]);

  // Lock body scroll when overlay is expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  const navigateToStock = useCallback(
    (symbol: string) => {
      setIsOpen(false);
      setQuery("");
      closeOverlay();
      router.push(`/stocks/${symbol}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  );

  const openOverlay = useCallback(() => {
    setIsExpanded(true);
    // Trigger animation on the next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
    });
    // Focus the overlay input after mount + animation start
    setTimeout(() => {
      overlayInputRef.current?.focus();
    }, 50);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsAnimatingIn(false);
    setIsOpen(false);
    // Wait for the exit animation to complete before unmounting
    setTimeout(() => {
      setIsExpanded(false);
      setQuery("");
      setResults([]);
    }, 300);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (compact && isExpanded) {
        e.preventDefault();
        closeOverlay();
        return;
      }
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

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
    }
  };

  // Handle global keyboard shortcut (Cmd/Ctrl + K) to open search
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (compact) {
          if (isExpanded) {
            closeOverlay();
          } else {
            openOverlay();
          }
        } else {
          inputRef.current?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [compact, isExpanded, openOverlay, closeOverlay]);

  // --- Shared results dropdown ---
  const renderResults = () => {
    if (!isOpen || results.length === 0) return null;

    return (
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                <StockLogo symbol={result.symbol} logoUrl={result.logo_url} domainUrl={result.domain_url} size={36} className="!text-[12px] text-zinc-600 dark:text-zinc-300" />
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

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                <AddToWatchlistMenu symbol={result.symbol} />
                {result.asset_type && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                    {result.asset_type}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // --- Compact mode: trigger button + overlay portal ---
  if (compact) {
    return (
      <>
        {/* Compact trigger — a styled search bar look */}
        <button
          type="button"
          onClick={openOverlay}
          className="flex items-center gap-2 w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-400 dark:text-zinc-500 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:text-zinc-500 dark:hover:text-zinc-400 transition-all duration-300 cursor-pointer group"
        >
          <Search className="w-4 h-4 shrink-0 transition-colors group-hover:text-emerald-500" />
          <span className="text-sm truncate">Search stocks...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-auto shrink-0 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            ⌘K
          </kbd>
        </button>

        {/* Full-screen overlay portal */}
        {isExpanded &&
          isMounted &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
              {/* Backdrop */}
              <div
                onClick={closeOverlay}
                className={cn(
                  "absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-opacity duration-300",
                  isAnimatingIn ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />

              {/* Search content container */}
              <div
                ref={overlayContentRef}
                className={cn(
                  "relative w-full max-w-2xl mx-4 transition-all duration-300 ease-out",
                  isAnimatingIn
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-4"
                )}
              >
                {/* Glow effect */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-emerald-400/10 to-teal-500/15 blur-2xl opacity-60 animate-pulse" />

                {/* Search input */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-emerald-500 pointer-events-none" />
                    <input
                      ref={overlayInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => results.length > 0 && setIsOpen(true)}
                      placeholder="Search stocks by name or symbol..."
                      className="w-full h-14 pl-12 pr-24 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-emerald-500/50 dark:focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/5 transition-all duration-300 text-base shadow-2xl shadow-black/10 dark:shadow-black/30"
                      autoComplete="off"
                      autoFocus
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                      ) : query ? (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            setResults([]);
                            setIsOpen(false);
                            overlayInputRef.current?.focus();
                          }}
                          className="p-0.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={closeOverlay}
                        className="flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      >
                        ESC
                      </button>
                    </div>
                  </div>

                  {/* Results dropdown */}
                  {renderResults()}
                </div>

                {/* Hint text */}
                {!query && !isOpen && (
                  <div className={cn(
                    "flex items-center justify-center gap-4 mt-4 text-xs text-zinc-400 dark:text-zinc-500 transition-opacity duration-500",
                    isAnimatingIn ? "opacity-100" : "opacity-0"
                  )}>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd>
                      Close
                    </span>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  // --- Non-compact (inline) mode — original behavior ---
  return (
    <div className="relative w-full mx-auto max-w-2xl">
      {/* Search input */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-teal-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search stocks by name or symbol..."
            className="w-full h-14 pl-12 pr-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-emerald-500/50 dark:focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/5 transition-all duration-300 text-base"
            autoComplete="off"
          />
          {isLoading ? (
            <Loader2 className="absolute right-4 w-5 h-5 text-zinc-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-4 p-0.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {renderResults()}
    </div>
  );
}
