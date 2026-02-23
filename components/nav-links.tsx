"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

const navLinks: NavLink[] = [
  { href: "/stocks", label: "Stocks", requiresAuth: true },
  { href: "/portfolio", label: "Portfolio", requiresAuth: true },
  { href: "/wallet", label: "Wallet", requiresAuth: true },
];

interface NavLinksProps {
  isAuthenticated: boolean;
}

export function NavLinks({ isAuthenticated }: NavLinksProps) {
  const pathname = usePathname();

  const visibleLinks = isAuthenticated
    ? navLinks
    : navLinks.filter((link) => !link.requiresAuth);

  return (
    <>
      {visibleLinks.map((link) => {
        const isActive = pathname === link.href;

        if (link.label === "Wallet") {
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors border",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                  : "text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              title="Wallet"
            >
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center px-2 md:px-3 py-2 text-[13px] md:text-sm lg:text-base font-medium rounded-lg transition-colors",
              isActive
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
