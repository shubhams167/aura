import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { BrokerConnect } from "@/components/broker-connect";
import { SupportedBrokers } from "@/components/supported-brokers";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black transition-colors duration-300">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32">
        <Hero user={session?.user} />
        {session?.user ? <BrokerConnect /> : <SupportedBrokers />}
      </main>

      <Footer />
    </div>
  );
}
