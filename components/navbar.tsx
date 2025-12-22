import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
	return (
		<nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-6 border-b border-zinc-200 dark:border-white/5">
			<div className="flex items-center gap-2 sm:gap-3">
				<Link href="/">
					<Logo size="sm" />
				</Link>
				<Badge
					variant="secondary"
					className="hidden sm:inline-flex bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 text-xs"
				>
					Beta
				</Badge>
			</div>
			<div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
				<Button
					variant="ghost"
					className="hidden md:inline-flex text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm lg:text-base"
					asChild
				>
					<Link href="#">Markets</Link>
				</Button>
				<Button
					variant="ghost"
					className="hidden md:inline-flex text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm lg:text-base"
					asChild
				>
					<Link href="#">Portfolio</Link>
				</Button>
				<ThemeToggle />
				<Button
					variant="ghost"
					className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm lg:text-base"
					asChild
				>
					<Link href="/login">Log in</Link>
				</Button>
				<Button
					className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm lg:text-base px-3 lg:px-4"
					asChild
				>
					<Link href="/signup">Sign up</Link>
				</Button>
			</div>
		</nav>
	);
}
