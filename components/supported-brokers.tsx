import Image from "next/image";

const brokers = [
  { name: "Groww", logo: "/logos/groww.webp" },
  { name: "Upstox", logo: "/logos/upstox.svg" },
  { name: "Zerodha", logo: "/logos/zerodha.svg" },
];

export function SupportedBrokers() {
  return (
    <section className="w-full max-w-3xl mx-auto mt-12 sm:mt-16">
      <div className="text-center mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
          Supported Brokers
        </p>
      </div>
      <div className="flex items-center justify-center gap-8 sm:gap-12">
        {brokers.map((broker) => (
          <div
            key={broker.name}
            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
              <Image
                src={broker.logo}
                alt={`${broker.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm sm:text-base font-medium text-zinc-600 dark:text-zinc-400 hidden sm:inline">
              {broker.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
