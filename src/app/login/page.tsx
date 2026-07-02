"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api, ApiError, type User } from "@/lib/api";
import { setSession } from "@/lib/auth";
import BrainLogo from "@/components/BrainLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fromExtension = searchParams.get("from") === "extension";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api<{ token: string; refresh_token: string; user: User }>(
        "/auth/login",
        { body: { email, password } },
      );
      setSession({ token: data.token, refresh_token: data.refresh_token, user: data.user });
      router.push(searchParams.get("next") ?? "/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <BrainLogo size={44} />
        <h1 className="text-2xl font-bold">Welcome back</h1>
        {fromExtension && (
          <p className="rounded-full border border-borderline bg-surface px-4 py-1.5 text-xs text-secondary">
            🧩 Login to unlock the extension counter
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-[color:var(--critical)]">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Logging in…" : "Login"}
        </button>

        <p className="text-center text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="font-medium text-accent-2 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
