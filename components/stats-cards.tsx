import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
	title: string;
	value: string;
	badge: {
		text: string;
		variant: "emerald" | "blue" | "amber";
	};
	progress: number; // 0-100
	className?: string;
}

const badgeStyles = {
	emerald: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
	blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
	amber: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
};

const progressStyles = {
	emerald: "bg-gradient-to-r from-emerald-400 to-teal-400",
	blue: "bg-gradient-to-r from-blue-400 to-violet-400",
	amber: "bg-gradient-to-r from-amber-400 to-orange-400",
};

function StatCard({ title, value, badge, progress, className }: StatCardProps) {
	return (
		<Card
			className={cn(
				"bg-white/80 dark:bg-white/5 border-zinc-200 dark:border-white/10 backdrop-blur-xl",
				"hover:bg-white dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl",
				className
			)}
		>
			<CardHeader className="pb-2 sm:pb-4">
				<CardDescription className="text-zinc-500 text-sm">
					{title}
				</CardDescription>
				<CardTitle className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-baseline gap-2">
					{value}
					<Badge className={cn(badgeStyles[badge.variant], "text-xs")}>
						{badge.text}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-2 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
					<div
						className={cn(
							"h-full rounded-full transition-all duration-500",
							progressStyles[badge.variant]
						)}
						style={{ width: `${progress}%` }}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

const stats: StatCardProps[] = [
	{
		title: "Total Market Cap",
		value: "$2.4T",
		badge: { text: "+2.4%", variant: "emerald" },
		progress: 75,
	},
	{
		title: "Active Traders",
		value: "1.2M",
		badge: { text: "+12.5%", variant: "blue" },
		progress: 66,
	},
	{
		title: "Stocks Tracked",
		value: "5,400+",
		badge: { text: "Live", variant: "amber" },
		progress: 83,
		className: "sm:col-span-2 lg:col-span-1",
	},
];

export function StatsCards() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 lg:mt-20 max-w-5xl w-full px-2">
			{stats.map((stat) => (
				<StatCard key={stat.title} {...stat} />
			))}
		</div>
	);
}
