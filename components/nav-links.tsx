"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

const navLinks: NavLink[] = [
  { href: "/portfolio", label: "Portfolio", requiresAuth: true },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
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

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "hidden md:inline-flex items-center px-3 py-2 text-sm lg:text-base font-medium rounded-lg transition-colors",
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
