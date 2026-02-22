"use client";

import { useState } from "react";
import Image from "next/image";

interface StockLogoProps {
  symbol: string;
  logoUrl?: string;
  domainUrl?: string;
  size?: number; // width and height for next/image
  className?: string;
}

export function StockLogo({ symbol, logoUrl, domainUrl, size = 40, className }: StockLogoProps) {
  // Track fallback state: 0 = ticker, 1 = domain, 2 = initials
  const [fallbackLevel, setFallbackLevel] = useState<number>(logoUrl ? 0 : (domainUrl ? 1 : 2));

  // Some APIs return "null" as string when parsing, so we check truthiness
  if (fallbackLevel === 0 && logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized
        onError={() => setFallbackLevel(domainUrl ? 1 : 2)}
      />
    );
  }

  if (fallbackLevel === 1 && domainUrl) {
    return (
      <Image
        src={domainUrl}
        alt={`${symbol} domain logo`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized
        onError={() => setFallbackLevel(2)}
      />
    );
  }

  // Fallback to initials
  return (
    <span className={className || "font-bold text-emerald-600 dark:text-emerald-400"} style={{ fontSize: `${Math.max(10, size / 2.5)}px` }}>
      {symbol.slice(0, 2)}
    </span>
  );
}
