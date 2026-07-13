"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { ApiError } from "@/lib/api";
import { clearSession, connectExtension, useSession } from "@/lib/auth";
import EffectsSettings from "@/components/EffectsSettings";

export default function SettingsPage() {
  const router = useRouter();
  const session = useSession();

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
    connectExtension(session);
  }, [session, router]);

  if (!session) return null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-secondary">
          Tune how hard the extension fights your brainrot.
        </p>
      </div>

      <EffectsSettings onAuthError={handleAuthError} />
    </main>
  );
}
