"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectBroker, BrokerType } from "@/lib/actions/broker";
import { Shield, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";

interface BrokerCredentialsModalProps {
  broker: BrokerType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isUpdate?: boolean;
}

const brokerInfo: Record<
  BrokerType,
  {
    name: string;
    logo: string;
    bgColor: string;
    instructions: string[];
    portalUrl: string;
    portalName: string;
  }
> = {
  groww: {
    name: "Groww",
    logo: "/logos/groww.webp",
    bgColor: "bg-[#00D09C]/10",
    instructions: [
      "Log in to your Groww account",
      "Go to Settings → Developer Options",
      "Click on 'Generate API Key'",
      "Copy your API Key and Secret",
    ],
    portalUrl: "https://groww.in/developer",
    portalName: "Groww Developer Portal",
  },
  upstox: {
    name: "Upstox",
    logo: "/logos/upstox.svg",
    bgColor: "bg-purple-500/10",
    instructions: [
      "Log in to Upstox Developer Console",
      "Navigate to 'My Apps' section",
      "Create a new app or select existing",
      "Copy the API Key and Secret",
    ],
    portalUrl: "https://account.upstox.com/developer/apps",
    portalName: "Upstox Developer Console",
  },
  zerodha: {
    name: "Zerodha",
    logo: "/logos/zerodha.svg",
    bgColor: "bg-[#387ED1]/10",
    instructions: [
      "Log in to Kite Connect Developer",
      "Go to 'Create App' or select existing app",
      "Note down your API Key",
      "Generate and copy your API Secret",
    ],
    portalUrl: "https://developers.kite.trade/",
    portalName: "Kite Connect",
  },
};

export function BrokerCredentialsModal({
  broker,
  isOpen,
  onClose,
  onSuccess,
  isUpdate = false,
}: BrokerCredentialsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!broker) return null;

  const info = brokerInfo[broker];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await connectBroker(broker, apiKey, apiSecret);
      if (result.success) {
        setApiKey("");
        setApiSecret("");
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to connect");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setApiKey("");
    setApiSecret("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <div
              className={`w-10 h-10 rounded-lg ${info.bgColor} flex items-center justify-center p-1.5`}
            >
              <Image
                src={info.logo}
                alt={`${info.name} logo`}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            {isUpdate ? "Update" : "Connect"} {info.name}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {isUpdate
              ? `Update your API credentials for ${info.name}.`
              : `Enter your API credentials to connect your ${info.name} account.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Instructions */}
          <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">
              How to get your credentials:
            </h4>
            <ol className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 list-decimal list-inside">
              {info.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <a
              href={info.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Open {info.portalName}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="apiKey" className="text-zinc-900 dark:text-white">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                required
                className="mt-1 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>
            <div>
              <Label
                htmlFor="apiSecret"
                className="text-zinc-900 dark:text-white"
              >
                API Secret
              </Label>
              <Input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your API secret"
                required
                className="mt-1 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Your credentials are encrypted with AES-256 encryption before
              being stored. We never store plain-text credentials.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !apiKey || !apiSecret}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : isUpdate ? (
                "Update Credentials"
              ) : (
                "Connect Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
}
