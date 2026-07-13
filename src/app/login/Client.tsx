"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type User } from "@/lib/api";
import { setSession, useSession } from "@/lib/auth";
import BrainLogo from "@/components/BrainLogo";

// OAuth client ids are public; env override for a different Google project.
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "735451463373-ue4n6c037upnnq8hs44f1bsie646meil.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const [error, setError] = useState("");
  const buttonRef = useRef<HTMLDivElement>(null);

  const next = searchParams.get("next") ?? "/dashboard";
  const fromExtension = searchParams.get("from") === "extension";

  // Already logged in → straight to the dashboard (or wherever `next` says).
  useEffect(() => {
    if (session) router.replace(next);
  }, [session, router, next]);

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      setError("");
      try {
        const data = await api<{ token: string; refresh_token: string; user: User }>(
          "/auth/google",
          { body: { credential: response.credential } },
        );
        setSession({ token: data.token, refresh_token: data.refresh_token, user: data.user });
        router.push(next);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Something went wrong");
      }
    },
    [router, next],
  );

  // Load Google Identity Services and render the sign-in button.
  useEffect(() => {
    if (session !== null) return; // hydrating or already logged in

    let cancelled = false;

    const init = () => {
      if (cancelled || !window.google || !buttonRef.current) return;
      // Avoid stacking buttons / re-init noise on Fast Refresh
      buttonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 300,
      });
    };

    if (window.google?.accounts?.id) {
      init();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", init);
      if (window.google?.accounts?.id) init();
      return () => {
        cancelled = true;
        existing.removeEventListener("load", init);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, [session, handleCredential]);

  if (session) return null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <BrainLogo size={44} />
        <h1 className="text-2xl font-bold">Welcome to BrainRot</h1>
        {fromExtension && (
          <p className="rounded-full border border-borderline bg-surface px-4 py-1.5 text-xs text-secondary">
            🧩 Login to unlock the extension counter
          </p>
        )}
      </div>

      <div className="card flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-secondary">Sign in or create your account</p>
        <div ref={buttonRef} />
        {error && <p className="text-sm text-[color:var(--critical)]">{error}</p>}
        <p className="px-6 text-center text-xs text-muted">
          New here? The same button creates your account — no forms, no
          passwords.
        </p>
      </div>
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
