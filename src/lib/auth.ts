"use client";

import { useSyncExternalStore } from "react";
import { api, API_URL, type User } from "@/lib/api";

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

// Another tab refreshed or logged out — re-render with the new session.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === SESSION_KEY || event.key === null) emit();
  });
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

// ---- silent refresh ----
// Refresh tokens rotate server-side with reuse detection, so a token may only
// ever be sent once. Two guards make that safe:
//  - single-flight promise: concurrent 401s in this tab share one call
//  - Web Lock + re-read: another tab may rotate while we wait for the lock;
//    if the session changed underneath us, use it instead of replaying the
//    old token (a replay trips reuse detection and kills every session).

let refreshPromise: Promise<Session | null> | null = null;

async function doRefresh(staleToken: string): Promise<Session | null> {
  const session = getSession();
  if (!session?.refresh_token) return null;
  if (session.token !== staleToken) return session; // another tab already refreshed

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
  }
}

export function refreshSession(): Promise<Session | null> {
  if (refreshPromise) return refreshPromise;

  const session = getSession();
  if (!session?.refresh_token) return Promise.resolve(null);

  refreshPromise = (async () => {
    try {
      if (navigator.locks) {
        return await navigator.locks.request("brainrot-refresh", () =>
          doRefresh(session.token),
        );
      }
      return await doRefresh(session.token);
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---- extension bridge (content script listens on this origin) ----
// The extension gets its OWN token pair (via /auth/extension-token), never the
// portal's: refresh tokens rotate, so two clients sharing one family would
// invalidate each other and trip the server's reuse detection.

let bridgeInstalled = false;
let mintPromise: Promise<void> | null = null;

function mintExtensionSession(): Promise<void> {
  if (mintPromise) return mintPromise;

  mintPromise = (async () => {
    try {
      const data = await api<{ token: string; refresh_token: string; user: User }>(
        "/auth/extension-token",
        { method: "POST", body: {} },
      );
      window.postMessage(
        {
          type: "BRAINROT_CONNECT",
          token: data.token,
          refresh_token: data.refresh_token,
          user: data.user,
        },
        window.location.origin,
      );
    } catch {
      // Server unreachable — the extension stays locked, next visit retries.
    } finally {
      mintPromise = null;
    }
  })();

  return mintPromise;
}

// The extension answers BRAINROT_QUERY (and announces on page load) with
// BRAINROT_EXTENSION_READY + whoever it's logged in as. Only hand out a new
// token pair when it isn't already connected as the current user.
function installBridge() {
  if (bridgeInstalled || typeof window === "undefined") return;
  bridgeInstalled = true;

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data as { type?: string; user?: User | null };
    if (data?.type !== "BRAINROT_EXTENSION_READY") return;

    const session = getSession();
    if (!session) return;
    if (data.user?.id === session.user.id) return; // already connected
    mintExtensionSession();
  });
}

export function connectExtension(session: Session | null = getSession()) {
  if (!session || typeof window === "undefined") return;
  installBridge();
  window.postMessage({ type: "BRAINROT_QUERY" }, window.location.origin);
}

// Hands effect settings to the extension so toggles apply instantly
// (the extension also re-syncs from the server every few minutes).
export function pushSettingsToExtension(settings: object) {
  window.postMessage(
    { type: "BRAINROT_SETTINGS", settings },
    window.location.origin,
  );
}

// Calls back once the extension confirms it holds a session for this user —
// either it stored a freshly minted token (CONNECTED) or it was already
// logged in as them (READY with a matching user).
export function watchExtension(onConnected: (user: User | null) => void) {
  const listener = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as { type?: string; user?: User | null };
    if (data?.type === "BRAINROT_CONNECTED") onConnected(data.user ?? null);
    if (
      data?.type === "BRAINROT_EXTENSION_READY" &&
      data.user &&
      data.user.id === getSession()?.user.id
    ) {
      onConnected(data.user);
    }
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
