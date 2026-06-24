"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-data text-xs tracking-[0.2em] text-ink-soft uppercase mb-2">
            Compliance Ledger
          </p>
          <h1 className="font-display text-3xl text-ink">GST Compliance CRM</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-paper-raised border border-rule rounded-lg p-8 shadow-sm"
        >
          <label
            htmlFor="password"
            className="block font-data text-xs uppercase tracking-wider text-ink-soft mb-2"
          >
            Access Password
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-rule rounded-md px-3 py-2.5 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold mb-4"
            placeholder="Enter the firm password"
          />

          {error && (
            <p className="text-sm text-[var(--overdue)] mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-ink text-paper font-medium py-2.5 rounded-md hover:bg-ink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Enter Dashboard"}
          </button>
        </form>

        <p className="text-center text-xs text-ink-soft mt-6">
          Internal tool · shared access for firm staff
        </p>
      </div>
    </div>
  );
}
