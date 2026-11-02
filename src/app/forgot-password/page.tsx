"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !newPassword) {
      setError("Please enter your registered email and a new password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reset password.");
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError("Network error while resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-stone-100 text-stone-900 flex items-center justify-center mx-auto">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-serif text-stone-900">
            Reset Account Password
          </h1>
          <p className="text-xs text-stone-500">
            Enter your registered email address and choose a new password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@ateliervera.com"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              New Password (minimum 6 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-stone-900 underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

