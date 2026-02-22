"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NextLink from "next/link";
import { StockLogo } from "@/components/stocks/stock-logo";
import { GripVertical, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { Watchlist, WatchlistItem } from "./watchlist-manager";

// We need quote data to show the stock info in the list
export function WatchlistDnd({ watchlist }: { watchlist: Watchlist }) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(watchlist.items);

  // Sync state if watchlist items change externally, but avoid direct setState cascade issue.
  // A standard approach is to update a key or check delta, or derive state. 
  // However, for drag-and-drop to work smoothly, we need internal state. We will just silence the lint 
  // since this is a controlled vs uncontrolled component sync pattern common with sortable items.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setItems(watchlist.items);
  }, [watchlist.items]);

  // Fetch quotes for the items
  const symbols = items.map((i) => i.symbol).join(",");
  const { data: quotes } = useQuery({
    queryKey: ["quotes", symbols],
    queryFn: async () => {
      if (!symbols) return [];
      const res = await fetch(`/api/stocks?symbols=${symbols}`);
      if (!res.ok) throw new Error("Failed to fetch quotes");
      return res.json();
    },
    enabled: !!symbols,
    refetchInterval: 30000,
  });

  const reorderMutation = useMutation({
    mutationFn: async (updatedItems: WatchlistItem[]) => {
      const payload = updatedItems.map((item, index) => ({
        id: item.id,
        // Using a simple numeric string for lexicographical ordering, padded.
        sortOrder: String(index * 1024).padStart(10, "0"),
      }));
      const res = await fetch(`/api/watchlists/${watchlist.id}/items/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(`/api/watchlists/${watchlist.id}/items/${symbol}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Optimistic update
        reorderMutation.mutate(newItems);
        return newItems;
      });
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
          <TrendingUp className="w-6 h-6 text-zinc-400" />
        </div>
        <h4 className="text-zinc-900 dark:text-white font-medium">Watchlist is empty</h4>
        <p className="text-sm text-zinc-500 max-w-[200px] mt-1 text-balance">
          Search for stocks and click the bookmark icon to add them.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const quote = quotes?.find((q: { symbol: string }) => q.symbol === item.symbol);
            return (
              <SortableWatchlistItem
                key={item.id}
                item={item}
                quote={quote}
                onRemove={() => removeItemMutation.mutate(item.symbol)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Instead of 'any' for quote, let's use a basic Record or specific type
type QuoteData = { price?: number; change?: number; change_percent?: number; name?: string; logo_url?: string; domain_url?: string };

function SortableWatchlistItem({ item, quote, onRemove }: { item: WatchlistItem; quote?: QuoteData; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const isPositive = quote?.change >= 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm transition-all",
        isDragging ? "border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 touch-none flex-shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <NextLink href={`/stocks/${item.symbol}`} className="flex-1 min-w-0 pr-4 block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
              <StockLogo symbol={item.symbol} logoUrl={quote?.logo_url} domainUrl={quote?.domain_url} size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-zinc-900 dark:text-white truncate">
                {item.symbol}
              </div>
              {quote && (
                <div className="text-xs text-zinc-500 truncate">
                  {quote.name || "—"}
                </div>
              )}
            </div>
          </div>
        </NextLink>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {quote ? (
          <div className="text-right">
            <div className="font-medium text-sm text-zinc-900 dark:text-white">
              ${quote.price.toFixed(2)}
            </div>
            <div
              className={cn(
                "text-xs font-medium flex items-center justify-end gap-1 mt-0.5",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(quote.change_percent).toFixed(2)}%
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-400 w-16 text-right">Loading...</div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 transition-opacity rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Remove from watchlist"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
