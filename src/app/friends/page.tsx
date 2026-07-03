"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type Competitor, type Invite } from "@/lib/api";
import { clearSession, useSession } from "@/lib/auth";

function CompetitorRow({
  competitor,
  isMe,
  rank,
  maxTotal,
}: {
  competitor: Competitor;
  isMe: boolean;
  rank: number;
  maxTotal: number;
}) {
  const width = maxTotal > 0 ? Math.max(2, (competitor.today_total / maxTotal) * 100) : 2;

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border px-4 py-3 ${
        isMe ? "border-accent/50 bg-surface-2" : "border-borderline"
      }`}
    >
      <span className="w-8 text-center text-lg">
        {rank === 1 ? "👑" : `#${rank}`}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-semibold">
            {competitor.name}
            {isMe && <span className="ml-1.5 text-xs font-normal text-muted">(you)</span>}
          </span>
          <span className="ml-auto text-sm font-bold tabular-nums">
            {competitor.today_total}
            <span className="ml-1 text-xs font-normal text-muted">today</span>
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full"
            style={{
              width: `${width}%`,
              background: "var(--accent)",
            }}
          />
        </div>

        <div className="mt-1.5 flex gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--series-yt)" }} />
            YT {competitor.today_youtube}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--series-ig)" }} />
            IG {competitor.today_instagram}
          </span>
          <span className="ml-auto">7 days: {competitor.week_total}</span>
        </div>
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const session = useSession();
  const [me, setMe] = useState<Competitor | null>(null);
  const [friends, setFriends] = useState<Competitor[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [acceptCode, setAcceptCode] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ me: Competitor; friends: Competitor[] }>("/friends")
      .then((d) => {
        setMe(d.me);
        setFriends(d.friends);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
        }
      });
    api<{ invites: Invite[] }>("/invites").then((d) => setInvites(d.invites)).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (session === undefined) return; // still hydrating — session unknown
    if (!session) {
      router.replace("/login");
      return;
    }
    load();
  }, [session, router, load]);

  async function generateInvite() {
    setBusy(true);
    setMessage(null);
    try {
      await api<{ invite: Invite }>("/invites", { method: "POST", body: {} });
      load();
    } catch (err) {
      setMessage({
        kind: "err",
        text: err instanceof ApiError ? err.message : "Could not create invite",
      });
    } finally {
      setBusy(false);
    }
  }

  async function acceptInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const data = await api<{ message: string; friend: { name: string } }>(
        `/invites/${acceptCode.trim().toUpperCase()}/accept`,
        { method: "POST", body: {} },
      );
      setMessage({ kind: "ok", text: `You and ${data.friend.name} are now friends ⚔️` });
      setAcceptCode("");
      load();
    } catch (err) {
      setMessage({
        kind: "err",
        text: err instanceof ApiError ? err.message : "Could not accept invite",
      });
    } finally {
      setBusy(false);
    }
  }

  function copyInviteLink(invite: Invite) {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${invite.code}`);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (!session) return null;

  const hasPending = invites.some((invite) => invite.status === "pending");
  const ranking = me ? [me, ...friends].sort((a, b) => a.today_total - b.today_total) : friends;
  const maxTotal = Math.max(...ranking.map((c) => c.today_total), 0);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold">Friends</h1>
      <p className="mt-1 text-sm text-secondary">
        Lowest brainrot today wears the crown. 👑
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* compete */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Today&apos;s leaderboard</h2>

          {ranking.length > 1 ? (
            <div className="space-y-3">
              {ranking.map((c, i) => (
                <CompetitorRow
                  key={c.id}
                  competitor={c}
                  isMe={c.id === me?.id}
                  rank={i + 1}
                  maxTotal={maxTotal}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted">
              No friends yet — send an invite code and start competing.
            </p>
          )}
        </div>

        {/* invites */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold">Invite a friend</h2>
            <p className="mt-1 text-xs text-muted">
              Generate a code, send them the link. When they accept you&apos;ll see
              each other&apos;s counts. One active code at a time — a new one
              unlocks when it&apos;s accepted.
            </p>
            <button
              onClick={generateInvite}
              disabled={busy || hasPending}
              className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasPending ? "You already have an active code" : "Generate invite code"}
            </button>

            {invites.length > 0 && (
              <ul className="mt-4 space-y-2">
                {invites.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center gap-2 rounded-2xl border border-borderline bg-surface-2 px-3 py-2"
                  >
                    <code className="text-sm font-bold tracking-wider">{invite.code}</code>
                    {invite.status === "pending" ? (
                      <button
                        onClick={() => copyInviteLink(invite)}
                        className="ml-auto text-xs font-medium text-accent-2 hover:underline"
                      >
                        {copiedId === invite.id ? "Copied ✓" : "Copy link"}
                      </button>
                    ) : (
                      <span className="ml-auto text-xs text-muted">
                        {invite.status === "accepted"
                          ? `✓ ${invite.accepted_by_name ?? "accepted"}`
                          : invite.status}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold">Got a code?</h2>
            <form onSubmit={acceptInvite} className="mt-3 flex gap-2">
              <input
                className="input flex-1 uppercase"
                placeholder="BRAIN-XXXXXX"
                value={acceptCode}
                onChange={(e) => setAcceptCode(e.target.value)}
              />
              <button
                type="submit"
                disabled={busy || acceptCode.trim().length < 5}
                className="btn-ghost"
              >
                Accept
              </button>
            </form>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.kind === "ok"
                  ? "text-[color:var(--good)]"
                  : "text-[color:var(--critical)]"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
