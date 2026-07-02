"use client";

import { useSyncExternalStore } from "react";
import { API_URL, type User } from "@/lib/api";

export type Session = { token: string; refresh_token: string; user: User };

const SESSION_KEY = "brainrot_session";

// ---- session store (localStorage behind useSyncExternalStore) ----

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw !== cachedRaw) {
      // cache so getSnapshot returns a stable reference between changes
      cachedRaw = raw;
      cachedSession = raw ? (JSON.parse(raw) as Session) : null;
    }
    return cachedSession;
  } catch {
    return null;
  }
}

// Three states: undefined = still hydrating (unknown — don't redirect yet),
// null = definitely logged out, Session = logged in.
export function useSession(): Session | null | undefined {
  return useSyncExternalStore<Session | null | undefined>(
    subscribe,
    getSession,
    () => undefined,
  );
}

export function setSession(session: Session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emit();
  connectExtension(session);
}

export function clearSession() {
  const session = getSession();

  // Revoke the refresh token server-side (fire-and-forget).
  if (session?.refresh_token) {
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
      keepalive: true,
    }).catch(() => {});
  }

  window.localStorage.removeItem(SESSION_KEY);
  emit();
  window.postMessage({ type: "BRAINROT_DISCONNECT" }, window.location.origin);
}

// ---- silent refresh (single-flight: concurrent 401s share one call) ----

let refreshPromise: Promise<Session | null> | null = null;

export function refreshSession(): Promise<Session | null> {
  if (refreshPromise) return refreshPromise;

  const session = getSession();
  if (!session?.refresh_token) return Promise.resolve(null);

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });

      if (!response.ok) {
        // Refresh token invalid/expired/reused — the session is truly dead.
        window.localStorage.removeItem(SESSION_KEY);
        emit();
        window.postMessage({ type: "BRAINROT_DISCONNECT" }, window.location.origin);
        return null;
      }

      const data = (await response.json()) as {
        token: string;
        refresh_token: string;
        user: User | null;
      };

      const next: Session = {
        token: data.token,
        refresh_token: data.refresh_token,
        user: data.user ?? session.user,
      };
      setSession(next);
      return next;
    } catch {
      // Network hiccup — keep the session, caller sees the original 401.
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---- extension bridge (content script listens on this origin) ----

export function connectExtension(session: Session | null = getSession()) {
  if (!session) return;
  window.postMessage(
    {
      type: "BRAINROT_CONNECT",
      token: session.token,
      refresh_token: session.refresh_token,
      user: session.user,
    },
    window.location.origin,
  );
}

// Hands effect settings to the extension so toggles apply instantly
// (the extension also re-syncs from the server every few minutes).
export function pushSettingsToExtension(settings: object) {
  window.postMessage(
    { type: "BRAINROT_SETTINGS", settings },
    window.location.origin,
  );
}

// Calls back once the extension confirms it stored the token.
export function watchExtension(onConnected: (user: User | null) => void) {
  const listener = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as { type?: string; user?: User | null };
    if (data?.type === "BRAINROT_CONNECTED") onConnected(data.user ?? null);
    if (data?.type === "BRAINROT_EXTENSION_READY") connectExtension();
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
