"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SocialButton } from "@/components/auth/social-button";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement email/password login logic
      console.log("Login data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    // TODO: Implement forgot password logic
    console.log("Forgot password for:", email);
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onBack={() => setShowForgotPassword(false)}
        onSubmit={handleForgotPassword}
      />
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      {/* Social login buttons */}
      <div className="space-y-3 mb-6">
        <SocialButton provider="google" disabled={isLoading} />
        <SocialButton provider="microsoft" disabled={isLoading} />
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <Separator className="bg-zinc-200 dark:bg-zinc-700" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-500">
          or continue with email
        </span>
      </div>

      {/* Login form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="h-12 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-zinc-700 dark:text-zinc-300"
            >
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="h-12 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

// Forgot Password Form Component
function ForgotPasswordForm({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        description="We've sent you a password reset link"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset email shortly.
          </p>
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-12 border-zinc-200 dark:border-zinc-700"
          >
            Back to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all"
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>

        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="w-full h-12 text-zinc-600 dark:text-zinc-400"
        >
          Back to login
        </Button>
      </form>
    </AuthLayout>
  );
}
