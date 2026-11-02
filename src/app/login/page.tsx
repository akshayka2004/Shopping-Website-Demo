"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, ShieldCheck, UserCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, showToast } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`);
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch {
      setError("Failed to connect to authentication service.");
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail("customer@ateliervera.com");
    setPassword("Customer@123");
    setError("");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@ateliervera.com");
    setPassword("Admin@123");
    setError("");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-stone-100 text-stone-900 flex items-center justify-center mx-auto">
            <Lock className="h-5 w-5" />
          </div>
          <h1
            data-testid="login-heading"
            className="text-2xl font-serif text-stone-900"
          >
            Sign In to Your Account
          </h1>
          <p className="text-xs text-stone-500">
            Access your saved addresses, order history, or store management
            portal.
          </p>
        </div>

        {error && (
          <div
            data-testid="login-error-alert"
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              data-testid="login-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-stone-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-stone-500 hover:text-stone-900 underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              data-testid="login-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <button
            type="submit"
            data-testid="login-submit-button"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:bg-stone-400 transition-colors"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-stone-100 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 text-center">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              data-testid="quickfill-customer-btn"
              onClick={fillDemoCustomer}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Customer Demo
            </button>
            <button
              type="button"
              data-testid="quickfill-admin-btn"
              onClick={fillDemoAdmin}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-amber-200 bg-amber-50/60 text-xs font-medium text-amber-900 hover:bg-amber-100"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-600 pt-2">
          New to our store?{" "}
          <Link
            href="/register"
            data-testid="go-to-register-link"
            className="font-semibold text-stone-900 underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

