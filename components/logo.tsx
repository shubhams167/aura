"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };

    const iconSizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-7 h-7",
    };

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
    };

    return (
        <div className={cn("flex items-center gap-2 sm:gap-3 group", className)}>
            <div
                className={cn(
                    sizeClasses[size],
                    "rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center",
                    "transition-all duration-500 ease-out",
                    "group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-emerald-500/30",
                    "relative overflow-hidden"
                )}
            >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                <svg
                    className={cn(
                        iconSizeClasses[size],
                        "text-white transition-transform duration-300 group-hover:scale-110"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                </svg>
            </div>
            {showText && (
                <span
                    className={cn(
                        textSizeClasses[size],
                        "font-bold text-zinc-900 dark:text-white transition-colors duration-300"
                    )}
                >
                    Aura
                </span>
            )}
        </div>
    );
}
