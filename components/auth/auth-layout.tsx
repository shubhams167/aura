import { Logo } from "@/components/logo";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export async function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  // Redirect to home if already logged in
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

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
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {description}
              </p>
            </div>

            {children}
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
