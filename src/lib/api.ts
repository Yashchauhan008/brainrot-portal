import { getSession, refreshSession } from "@/lib/auth";

// Tolerate common env mistakes: a missing scheme (the browser would treat
// the host as a relative path) and trailing slashes (would produce //auth/…).
function normalizeBaseUrl(raw: string | undefined) {
  const url = (raw ?? "http://localhost:3017").trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

export const API_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

async function request<T>(path: string, options: ApiOptions, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ?? "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = options.token ?? getSession()?.token;

  try {
    return await request<T>(path, options, token);
  } catch (error) {
    // Access token expired → silently refresh once, then retry the request.
    const isAuthPath = path.startsWith("/auth/");
    if (error instanceof ApiError && error.status === 401 && !isAuthPath && !options.token) {
      const refreshed = await refreshSession();
      if (refreshed) return request<T>(path, options, refreshed.token);
    }
    throw error;
  }
}

// ---- API types ----

export type User = { id: string; name: string; email: string };

export type PlatformSplit = { youtube: number; instagram: number; total: number };

export type TodayStats = { today: PlatformSplit; last_24h: PlatformSplit };

export type HistoryDay = PlatformSplit & { date: string };

export type Invite = {
  id: string;
  code: string;
  status: "pending" | "accepted" | "expired";
  created_at: string;
  accepted_at: string | null;
  accepted_by_name?: string | null;
};

export type Settings = {
  rot_icon_enabled: boolean;
  screen_fade_enabled: boolean;
  milestone_popups_enabled: boolean;
  hard_block_enabled: boolean;
  daily_target: number;
};

export type Competitor = {
  id: string;
  name: string;
  today_youtube: number;
  today_instagram: number;
  today_total: number;
  week_total: number;
};
