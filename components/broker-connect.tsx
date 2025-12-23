"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrokerCredentialsModal } from "@/components/broker-credentials-modal";
import {
  getBrokerConnections,
  disconnectBroker,
  BrokerType,
  BrokerConnection,
} from "@/lib/actions/broker";
import { Check, Link2, Unlink, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";

const brokerDetails: Record<
  BrokerType,
  {
    name: string;
    description: string;
    logo: string;
    bgColor: string;
  }
> = {
  groww: {
    name: "Groww",
    description: "Stocks, Mutual Funds & More",
    logo: "/logos/groww.webp",
    bgColor: "bg-[#00D09C]/10",
  },
  upstox: {
    name: "Upstox",
    description: "Discount Broker for Trading",
    logo: "/logos/upstox.svg",
    bgColor: "bg-purple-500/10",
  },
  zerodha: {
    name: "Zerodha",
    description: "India's Largest Stock Broker",
    logo: "/logos/zerodha.svg",
    bgColor: "bg-[#387ED1]/10",
  },
};

export function BrokerConnect() {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<BrokerType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<BrokerType | null>(null);

  const loadConnections = async () => {
    setIsLoading(true);
    const data = await getBrokerConnections();
    setConnections(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleConnect = (broker: BrokerType) => {
    setSelectedBroker(broker);
    setIsUpdating(false);
    setIsModalOpen(true);
  };

  const handleUpdate = (broker: BrokerType) => {
    setSelectedBroker(broker);
    setIsUpdating(true);
    setIsModalOpen(true);
  };

  const handleDisconnect = async (broker: BrokerType) => {
    setDisconnecting(broker);
    await disconnectBroker(broker);
    await loadConnections();
    setDisconnecting(null);
  };

  const handleSuccess = () => {
    loadConnections();
  };

  return (
    <section className="w-full max-w-4xl mx-auto mt-12 sm:mt-16">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Connect Your Broker
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Link your trading accounts to track your investments in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(brokerDetails) as BrokerType[]).map((broker) => {
          const details = brokerDetails[broker];
          const connection = connections.find((c) => c.broker === broker);
          const isConnected = connection?.connected;

          return (
            <div
              key={broker}
              className={`relative p-5 rounded-2xl border transition-all duration-300 ${isConnected
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
            >
              {/* Connected Badge */}
              {isConnected && (
                <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white border-0 text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}

              {/* Broker Logo */}
              <div
                className={`w-14 h-14 rounded-xl ${details.bgColor} flex items-center justify-center mb-4 p-2`}
              >
                <Image
                  src={details.logo}
                  alt={`${details.name} logo`}
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Broker Info */}
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                {details.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                {details.description}
              </p>

              {/* Action Buttons */}
              {isLoading ? (
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                </Button>
              ) : isConnected ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => handleUpdate(broker)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Credentials
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDisconnect(broker)}
                    disabled={disconnecting === broker}
                  >
                    {disconnecting === broker ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Unlink className="w-4 h-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  onClick={() => handleConnect(broker)}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <BrokerCredentialsModal
        broker={selectedBroker}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        isUpdate={isUpdating}
      />
    </section>
  );
}
