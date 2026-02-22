import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = "USD", options: Intl.NumberFormatOptions = {}) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      ...options,
    }).format(value)
  } catch (error) {
    // Fallback if currency code is invalid
    return `$${value.toFixed(2)}`
  }
}

export function formatCompactCurrency(value: number, currency: string = "USD", options: Intl.NumberFormatOptions = {}) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      notation: "compact",
      maximumFractionDigits: 2,
      ...options,
    }).format(value)
  } catch (error) {
    // Fallback
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }
}
