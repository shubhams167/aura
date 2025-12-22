import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
          {/* 404 illustration */}
          <div className="mb-8">
            <span className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              404
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
            Page not found
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            Oops! The page you&apos;re looking for seems to have wandered off.
            It might have been moved, deleted, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 h-12 rounded-full"
            >
              <Link href="/">Go back home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white px-6 h-12 rounded-full"
            >
              <Link href="/login">Sign in</Link>
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
