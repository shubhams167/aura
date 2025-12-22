"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-center py-8">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </header>

          {/* Main content */}
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              {/* Error icon */}
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-red-900/30 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-400"
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

              <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                Critical Error
              </h1>

              <p className="text-zinc-400 mb-8 leading-relaxed">
                A critical error has occurred. Please try refreshing the page or
                contact support if the problem persists.
              </p>

              {error.digest && (
                <p className="text-xs text-zinc-500 mb-6 font-mono bg-zinc-800 px-3 py-2 rounded-lg inline-block">
                  Error ID: {error.digest}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={reset}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 h-12 rounded-full font-medium transition-colors"
                >
                  Try again
                </button>
                <a
                  href="/"
                  className="w-full sm:w-auto border border-zinc-700 text-white px-6 h-12 rounded-full font-medium flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  Go back home
                </a>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6 text-center">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} Aura. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
