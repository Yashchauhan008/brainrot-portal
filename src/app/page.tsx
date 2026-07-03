"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSession } from "@/lib/auth";
import BrainLogo from "@/components/BrainLogo";

const FEATURES = [
  {
    emoji: "🧠",
    title: "Track your brainrot",
    text: "The extension counts every Reel and Short you watch — a floating brain follows you around with your 24h total.",
  },
  {
    emoji: "⚔️",
    title: "Compete with friends",
    text: "Invite friends with a code. Whoever watches the least brainrot each day wins the crown.",
  },
  {
    emoji: "📈",
    title: "See your history",
    text: "Daily counts are stored per platform, so you can watch your habit shrink (or spiral).",
  },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 pb-20 pt-24 text-center">
      <div className="flex items-center gap-3">
        <BrainLogo size={56} />
        <h1 className="text-5xl font-extrabold tracking-tight">
          BrainRot <span className="text-accent-2">Counter</span>
        </h1>
      </div>

      <p className="mt-6 max-w-xl text-lg text-secondary">
        Every Reel. Every Short. Counted. Compete with your friends to see who
        can keep the cleanest brain.
      </p>

      <div className="mt-10 flex gap-4">
        <Link href="/login" className="btn-primary !px-8 !py-3">
          Get started with Google
        </Link>
      </div>

      <div className="mt-20 grid w-full gap-5 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card text-left">
            <div className="text-3xl">{f.emoji}</div>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{f.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
