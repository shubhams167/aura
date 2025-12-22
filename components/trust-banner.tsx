const partners = ["Bloomberg", "Reuters", "NASDAQ", "NYSE"];

export function TrustBanner() {
	return (
		<div className="mt-16 sm:mt-20 lg:mt-24 text-center px-4">
			<p className="text-zinc-500 text-xs sm:text-sm uppercase tracking-widest mb-4">
				Trusted by investors worldwide
			</p>
			<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 opacity-40">
				{partners.map((partner) => (
					<span
						key={partner}
						className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white"
					>
						{partner}
					</span>
				))}
			</div>
		</div>
	);
}
