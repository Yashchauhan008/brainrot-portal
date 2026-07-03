"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  api,
  ApiError,
  type HistoryDay,
  type TodayStats,
} from "@/lib/api";
import { clearSession, connectExtension, useSession, watchExtension } from "@/lib/auth";
import ExtensionGuide from "@/components/ExtensionGuide";
import HistoryChart from "@/components/HistoryChart";
import StatCard from "@/components/StatCard";

const RANGES = [7, 14, 30] as const;

export default function DashboardPage() {
  const router = useRouter();
  const session = useSession();
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [range, setRange] = useState<(typeof RANGES)[number]>(14);
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [error, setError] = useState("");

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router],
  );

  useEffect(() => {
    if (session === undefined) return; // still hydrating — session unknown
    if (!session) {
      router.replace("/login");
      return;
    }

    // hand the token to the extension + watch for its confirmation
    const stop = watchExtension(() => setExtensionConnected(true));
    connectExtension(session);

    api<TodayStats>("/stats/today")
      .then(setStats)
      .catch((err) => {
        if (!handleAuthError(err)) setError("Could not load stats — is the server running?");
      });

    return stop;
  }, [session, router, handleAuthError]);

  useEffect(() => {
    if (!session) return;
    api<{ history: HistoryDay[] }>(`/stats/history?days=${range}`)
      .then((d) => setHistory(d.history))
      .catch(handleAuthError);
  }, [session, range, handleAuthError]);

  if (!session) return null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="font-semibold text-muted">{session.user.name}</span>
          </h1>
          <p className="mt-1.5 text-sm text-secondary">
            Here&apos;s how rotten your brain is today.
          </p>
        </div>
        <span
          className={`ml-auto rounded-full border px-4 py-1.5 text-xs font-medium ${
            extensionConnected
              ? "border-transparent"
              : "border-borderline text-muted"
          }`}
          style={
            extensionConnected
              ? {
                  background: "color-mix(in srgb, var(--good) 15%, transparent)",
                  color: "var(--accent-2)",
                }
              : undefined
          }
        >
          {extensionConnected ? "🧩 Extension connected" : "🧩 Extension not detected"}
        </span>
      </div>

      {error && (
        <div className="card mb-6 border-[color:var(--critical)]/40 text-sm text-secondary">
          {error}
        </div>
      )}

      {!extensionConnected && <ExtensionGuide />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today"
          value={stats?.today.total ?? "–"}
          hint="Reels + Shorts, midnight to midnight — matches the bubble"
        />
        <StatCard
          label="YouTube Shorts"
          value={stats?.today.youtube ?? "–"}
          hint="today"
          accentVar="var(--series-yt)"
        />
        <StatCard
          label="Insta Reels"
          value={stats?.today.instagram ?? "–"}
          hint="today"
          accentVar="var(--series-ig)"
        />
      </div>

      <div className="card mt-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="font-semibold">Watch history</h2>
          <div className="ml-auto flex gap-1 rounded-full border border-borderline bg-surface-2 p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                  range === r ? "bg-background text-primary" : "text-muted hover:text-secondary"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        {history.length > 0 ? (
          <HistoryChart history={history} />
        ) : (
          <p className="py-10 text-center text-sm text-muted">Loading history…</p>
        )}
      </div>
    </main>
  );
}
