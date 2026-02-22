"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Loader2, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Watchlist } from "./watchlist-manager";
import { useState } from "react";

export function AddToWatchlistMenu({ symbol, className }: { symbol: string; className?: string }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // A single useQuery call. React Query will deduplicate this automatically 
  // across all instances of AddToWatchlistMenu on the screen.
  const { data: watchlists, isLoading } = useQuery<Watchlist[]>({
    queryKey: ["watchlists"],
    queryFn: async () => {
      const res = await fetch("/api/watchlists");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes before refetching
  });

  const inAnyWatchlist = watchlists?.some(w => w.items.some(i => i.symbol === symbol)) || false;

  const addItemMutation = useMutation({
    mutationFn: async (watchlistId: string) => {
      const res = await fetch(`/api/watchlists/${watchlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (watchlistId: string) => {
      const res = await fetch(`/api/watchlists/${watchlistId}/items/${symbol}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const toggleWatchlist = (list: Watchlist, isIncluded: boolean) => {
    if (isIncluded) {
      removeItemMutation.mutate(list.id);
    } else {
      addItemMutation.mutate(list.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-2 rounded-xl transition-all",
            inAnyWatchlist
              ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
              : "text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            className
          )}
          title="Add to Watchlist"
          onClick={(e) => {
            // We only stop propagation here so the click doesn't bubble up to the card's Link.
            // DO NOT use preventDefault() here as it breaks the Radix Popover trigger.
            e.stopPropagation();
          }}
        >
          {inAnyWatchlist ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[240px] p-2 rounded-xl border-zinc-200 dark:border-zinc-700 shadow-xl dark:bg-zinc-900 bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Save to Watchlist</h4>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          </div>
        ) : !watchlists || watchlists.length === 0 ? (
          <div className="p-3 text-center text-sm text-zinc-500">
            No watchlists found. Create one from the Stocks page.
          </div>
        ) : (
          <div className="space-y-1">
            {watchlists.map((list) => {
              const isIncluded = list.items.some(i => i.symbol === symbol);
              const isPending = (addItemMutation.isPending && addItemMutation.variables === list.id) ||
                (removeItemMutation.isPending && removeItemMutation.variables === list.id);
              return (
                <button
                  key={list.id}
                  onClick={() => toggleWatchlist(list, isIncluded)}
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm transition-colors text-left"
                >
                  <span className={cn(
                    "truncate pr-2",
                    isIncluded ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-zinc-700 dark:text-zinc-300"
                  )}>
                    {list.name}
                  </span>

                  {isPending ? (
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
                  ) : isIncluded ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
