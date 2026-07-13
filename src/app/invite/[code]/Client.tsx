"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import BrainLogo from "@/components/BrainLogo";

type State =
  | { status: "working" }
  | { status: "done"; friendName: string }
  | { status: "error"; message: string };

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const [state, setState] = useState<State>({ status: "working" });
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !params.code) return;
    fired.current = true;

    const code = params.code.toUpperCase();

    if (!getSession()) {
      router.replace(`/login?next=/invite/${code}`);
      return;
    }

    api<{ friend: { name: string } }>(`/invites/${code}/accept`, {
      method: "POST",
      body: {},
    })
      .then((data) => setState({ status: "done", friendName: data.friend.name }))
      .catch((err) =>
        setState({
          status: "error",
          message: err instanceof ApiError ? err.message : "Could not accept invite",
        }),
      );
  }, [params.code, router]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <BrainLogo size={52} />

      {state.status === "working" && (
        <p className="mt-6 text-secondary">Accepting invite…</p>
      )}

      {state.status === "done" && (
        <>
          <h1 className="mt-6 text-2xl font-bold">You&apos;re in ⚔️</h1>
          <p className="mt-2 text-secondary">
            You and <span className="font-semibold text-primary">{state.friendName}</span>{" "}
            are now competing for the cleanest brain.
          </p>
          <Link href="/friends" className="btn-primary mt-8">
            See the leaderboard
          </Link>
        </>
      )}

      {state.status === "error" && (
        <>
          <h1 className="mt-6 text-2xl font-bold">Hmm, that didn&apos;t work</h1>
          <p className="mt-2 text-sm text-[color:var(--critical)]">{state.message}</p>
          <Link href="/friends" className="btn-ghost mt-8">
            Go to friends
          </Link>
        </>
      )}
    </main>
  );
}
