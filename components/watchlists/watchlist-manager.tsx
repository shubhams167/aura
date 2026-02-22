"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Edit2, Trash2, List, MoreVertical, X, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { WatchlistDnd } from "./watchlist-dnd";

export type Watchlist = {
  id: string;
  name: string;
  items: WatchlistItem[];
};

export type WatchlistItem = {
  id: string;
  watchlistId: string;
  symbol: string;
  sortOrder: string;
};

export function WatchlistManager() {
  const queryClient = useQueryClient();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: watchlists, isLoading } = useQuery<Watchlist[]>({
    queryKey: ["watchlists"],
    queryFn: async () => {
      const res = await fetch("/api/watchlists");
      if (!res.ok) throw new Error("Failed to fetch watchlists");
      return res.json();
    },
  });

  // Default to first list if none selected
  if (watchlists && watchlists.length > 0 && !activeListId) {
    setActiveListId(watchlists[0].id);
  }

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create watchlist");
      return res.json();
    },
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      setActiveListId(newList.id);
      setIsCreating(false);
      setNewListName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/watchlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update watchlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      setEditingListId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/watchlists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete watchlist");
      return res.json();
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      if (activeListId === deletedId) {
        setActiveListId(null);
      }
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createMutation.mutate(newListName.trim());
    }
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editName.trim()) {
      updateMutation.mutate({ id, name: editName.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const activeList = watchlists?.find((l) => l.id === activeListId);

  return (
    <div className="flex flex-col w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-black/20">
      {/* Header and List Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center shrink-0 border border-emerald-500/20 hidden sm:flex">
            <List className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">Your Watchlists</h2>
            <p className="text-xs text-zinc-500">
              {watchlists?.length || 0} list{(watchlists?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {watchlists && watchlists.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] justify-between bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 h-10 rounded-xl">
                {activeList?.name || "Select Watchlist..."}
                <MoreVertical className="w-4 h-4 text-zinc-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl" align="end">
              <div className="space-y-1">
                {watchlists.map((list) => (
                  <div key={list.id} className="group flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg pr-1">
                    <button
                      className="flex-1 text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 truncate"
                      onClick={() => setActiveListId(list.id)}
                    >
                      {list.name}
                    </button>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingListId(list.id);
                          setEditName(list.name);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(list.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New List
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 sm:p-5 min-h-[400px] flex flex-col relative bg-zinc-50/50 dark:bg-black/20">
        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Create Watchlist</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="E.g. Tech Stocks, Dividends"
                className="flex-1 h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                autoFocus
              />
              <Button type="submit" disabled={!newListName.trim() || createMutation.isPending} className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="h-10 px-3 rounded-xl">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>
        ) : editingListId ? (
          <form onSubmit={(e) => handleEditSubmit(e, editingListId)} className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Rename Watchlist</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                autoFocus
              />
              <Button type="submit" disabled={!editName.trim() || updateMutation.isPending} className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditingListId(null)} className="h-10 px-3 rounded-xl">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>
        ) : !watchlists || watchlists.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4 py-12 h-full my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center">
              <List className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No watchlists yet</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[250px] mx-auto">
                Create your first watchlist to track your favorite stocks in one place.
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Create Watchlist
            </Button>
          </div>
        ) : activeList ? (
          <WatchlistDnd watchlist={activeList} />
        ) : null}
      </div>
    </div>
  );
}
