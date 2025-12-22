"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center py-8">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md">
          {/* Error icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-500 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
            Something went wrong
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            We apologize for the inconvenience. An unexpected error has
            occurred. Our team has been notified and is working to fix it.
          </p>

          {error.digest && (
            <p className="text-xs text-zinc-500 mb-6 font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg inline-block">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={reset}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 h-12 rounded-full"
            >
              Try again
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white px-6 h-12 rounded-full"
            >
              <Link href="/">Go back home</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-zinc-500 text-sm">
          © {new Date().getFullYear()} Aura. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
