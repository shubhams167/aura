"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Newspaper, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  publisher?: string;
  link?: string;
  provider_publish_time?: number;
  thumbnail_url?: string;
}

interface StockNewsProps {
  symbol: string;
}

export function StockNews({ symbol }: StockNewsProps) {
  const { data: news, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["stock", symbol, "news"],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${symbol}/news?limit=5`);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    staleTime: 300_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-6 mt-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-emerald-500" />
          Latest News
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-6 mt-6">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-emerald-500" />
        Latest News
      </h2>

      <div className="space-y-4">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 p-4 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
          >
            {/* Thumbnail */}
            {item.thumbnail_url && (
              <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-24 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                {item.publisher && (
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {item.publisher}
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  •
                </span>
                {item.provider_publish_time && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDistanceToNow(item.provider_publish_time * 1000, { addSuffix: true })}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Read article <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
