import Link from "next/link";
import { StockSearch } from "@/components/stocks/stock-search";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { NavLinks } from "@/components/nav-links";
import { auth } from "@/lib/auth";

export async function Navbar() {
	const session = await auth();
	const isAuthenticated = !!session?.user;

	return (
		<nav className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 border-b border-zinc-200 dark:border-white/5">
			<div className="flex items-center gap-2 sm:gap-3 shrink-0">
				<Link href="/">
					<Logo size="sm" />
				</Link>
			</div>

			{isAuthenticated && (
				<div className="flex flex-1 justify-end md:justify-center max-w-xl">
					<StockSearch compact />
				</div>
			)}

			<div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
				<NavLinks isAuthenticated={isAuthenticated} />
				<ThemeToggle />

				{session?.user ? (
					<UserMenu user={session.user} />
				) : (
					<>
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
					</>
				)}
			</div>
		</nav>
	);
}
