"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import BrainLogo from "@/components/BrainLogo";
import RottingBrain from "./RottingBrain";

const ROASTS = [
  "🧠🪰 your brain is officially compost",
  "47?! the rot is terminal — seek grass immediately",
  "legends say you can still put the phone down",
  "Daily limit reached. Go touch grass 🌱",
  "Unlocks at midnight. The algorithm can wait.",
  "Lowest brainrot today wears the crown 👑",
];

const FEATURES = [
  {
    kicker: "01 · Bubble",
    title: "A floating brain that never lies",
    text: "Drag it. Ignore it. It still counts every Reel and Short in the last 24 hours — YouTube and Instagram, no mercy.",
  },
  {
    kicker: "02 · Decay",
    title: "Watch your brain compost in 4 stages",
    text: "Fresh pink → suspicious green → composting → terminal brown. Cross your daily target and the icon starts looking like leftovers.",
  },
  {
    kicker: "03 · Fade",
    title: "The screen gets darker. On purpose.",
    text: "Past your limit, a soft fade creeps in (up to 88%). Not a bug — a vibe check from Future You.",
  },
  {
    kicker: "04 · Wall",
    title: "Hard block until midnight",
    text: "Optional nuclear mode: scroll-swallowing wall when you hit the target. Polite enough to disable. Annoying enough to work.",
  },
  {
    kicker: "05 · Crown",
    title: "Friends, but make it competitive",
    text: "Invite with BRAIN-XXXXXX. Least brainrot today wins the crown. Double-click the bubble to flex (or cry).",
  },
  {
    kicker: "06 · History",
    title: "Charts for your crimes",
    text: "Portal history splits YouTube vs Instagram so you know exactly which app ate your evening.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Sign in with Google",
    text: "One click. No password fanfic. Your rotten stats sync to the cloud.",
  },
  {
    n: "2",
    title: "Install the extension",
    text: "Grab github.com/Yashchauhan008/brainrot-extension, Load unpacked in Chrome, and the bubble starts riding your Reels & Shorts.",
  },
  {
    n: "3",
    title: "Scroll… and get roasted",
    text: "Milestones pop. The brain decays. Friends steal your crown. Grass gets touched (allegedly).",
  },
];

function RoastMarquee() {
  const line = [...ROASTS, ...ROASTS];
  return (
    <div className="landing-marquee border-y border-borderline bg-surface/60 py-3">
      <div className="landing-marquee-track">
        {line.map((roast, i) => (
          <span
            key={`${roast}-${i}`}
            className="mx-8 whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-secondary"
          >
            {roast}
            <span className="ml-8 text-accent-2">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function BubbleDemo() {
  const [count, setCount] = useState(7);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c >= 42 ? 7 : c + 1));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-borderline bg-[#0a0c0b] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2 border-b border-borderline px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d05a4e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#cbe08a]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          shorts · live demo
        </span>
      </div>
          <div className="relative aspect-[9/14] bg-linear-to-b from-[#151a16] to-[#0a0c0b] p-4">
        <div className="absolute inset-x-8 top-16 bottom-24 rounded-2xl border border-borderline/70 bg-surface-2/40" />
        <div className="absolute inset-x-10 top-24 space-y-3">
          <div className="h-3 w-2/3 rounded-full bg-borderline/80" />
          <div className="h-3 w-1/2 rounded-full bg-borderline/50" />
          <div className="mt-8 h-40 rounded-2xl bg-linear-to-br from-accent/20 via-transparent to-[#f48fb1]/15" />
        </div>

        <div className="landing-float absolute bottom-10 right-6 flex items-center gap-2 rounded-full border border-borderline bg-background/95 py-2 pl-2 pr-3 shadow-xl backdrop-blur">
          <BrainLogo size={28} />
          <span className="font-mono text-sm font-bold text-accent-2">{count}</span>
        </div>

        <div className="landing-toast absolute left-4 right-16 top-1/2 rounded-2xl border border-[#ad1457]/40 bg-[#1a1216]/95 px-4 py-3 text-left text-xs leading-relaxed text-[#f8bbd0] shadow-2xl backdrop-blur">
          🧠🪰 {count} brainrot videos today — your brain is officially compost
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  return (
    <div className="landing-root relative overflow-x-clip">
      {/* atmospheric wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#f48fb1]/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-[480px] w-[480px] rounded-full bg-accent/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-accent-2/10 blur-[120px]" />
        <div className="landing-grid absolute inset-0 opacity-[0.35]" />
      </div>

      {/* top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <BrainLogo size={28} />
          <span className="text-sm font-bold tracking-wide">BrainRot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost !px-4 !py-2 text-xs">
            Log in
          </Link>
          <Link href="/login" className="btn-primary !px-4 !py-2 text-xs">
            Start rotting less
          </Link>
        </div>
      </header>

      {/* HERO — brand first, one job */}
      <section className="relative mx-auto grid min-h-[calc(100svh-72px)] w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:pb-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-borderline bg-surface/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-2" />
            Chrome extension + portal · free to start
          </p>

          <h1 className="landing-display text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.92] tracking-tight">
            BrainRot
            <br />
            <span className="text-accent-2">Counter</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-secondary md:text-lg">
            Every Reel. Every Short. Counted — then roasted. Compete with friends
            for the cleanest brain. Touch grass. Optionally.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/login" className="btn-primary !px-8 !py-3.5 text-sm">
              Get started with Google
            </Link>
            <a href="#how" className="btn-ghost !px-6 !py-3.5 text-sm">
              How the rot works
            </a>
          </div>

          <p className="mt-5 max-w-sm text-xs leading-relaxed text-muted">
            No passwords. No judgment… okay, lots of judgment. But the soft kind —
            with milestones and a crown.
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <RottingBrain size={240} />
        </div>
      </section>

      <RoastMarquee />

      {/* live demo + portal shot */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-16">
        <div>
          <p className="label">In the wild</p>
          <h2 className="landing-display mt-3 text-4xl leading-none md:text-5xl">
            It floats on your feed.
            <span className="text-accent-2"> It keeps score.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-secondary md:text-base">
            A draggable brain bubble sits on Reels &amp; Shorts with your 24h count.
            Hit milestones and get lovingly insulted. Cross the line and the page
            starts dimming like your dopamine.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-secondary">
            {[
              "YouTube Shorts + Instagram Reels",
              "Offline queue — counts even when the API naps",
              "Effects you can toggle before they hurt your feelings",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 text-accent-2">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <BubbleDemo />
      </section>

      {/* portal screenshot */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-8">
        <div className="overflow-hidden rounded-[2rem] border border-borderline bg-surface shadow-[0_50px_120px_-50px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between border-b border-borderline px-5 py-3">
            <div className="flex items-center gap-2">
              <BrainLogo size={20} />
              <span className="text-xs font-semibold">Portal · dashboard</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              brainrot.quicklabs.pro
            </span>
          </div>
          <div className="relative aspect-16/9 bg-background">
            <Image
              src="/images/portal.png"
              alt="BrainRot portal dashboard showing stats and history"
              fill
              quality={75}
              className="object-cover object-top"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Here&apos;s how rotten your brain is today — with charts, friends, and settings to tune the pain.
        </p>
      </section>

      {/* how it works */}
      <section id="how" className="mx-auto w-full max-w-6xl px-6 py-24">
        <p className="label">How it works</p>
        <h2 className="landing-display mt-3 max-w-2xl text-4xl leading-[0.95] md:text-6xl">
          Three steps to a cleaner brain
          <span className="text-accent-2"> (or a funnier spiral).</span>
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="relative overflow-hidden rounded-[1.75rem] border border-borderline bg-surface p-7"
            >
              <span className="landing-display text-6xl text-accent-2/25">{step.n}</span>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features detail */}
      <section className="border-y border-borderline bg-surface/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <p className="label">Full toolkit</p>
          <h2 className="landing-display mt-3 max-w-3xl text-4xl leading-[0.95] md:text-5xl">
            Everything you need to shame your scroll
          </h2>

          <div className="mt-14 divide-y divide-borderline border-y border-borderline">
            {FEATURES.map((f) => (
              <div
                key={f.kicker}
                className="grid gap-3 py-8 md:grid-cols-[11rem_1fr_1.2fr] md:items-start md:gap-8"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-2">
                  {f.kicker}
                </p>
                <h3 className="text-xl font-semibold md:text-2xl">{f.title}</h3>
                <p className="text-sm leading-relaxed text-secondary md:text-base">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* roast board */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="grid items-end gap-10 md:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="label">Sample roasts</p>
            <h2 className="landing-display mt-3 text-4xl leading-none md:text-5xl">
              Written by someone who also scrolls too much
            </h2>
          </div>
          <div className="space-y-3">
            {ROASTS.slice(0, 4).map((roast) => (
              <div
                key={roast}
                className="rounded-2xl border border-borderline bg-background px-5 py-4 font-mono text-sm text-[#f8bbd0]"
              >
                {roast}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-borderline bg-surface px-8 py-14 text-center md:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#f48fb1]/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          />

          <div className="relative mx-auto flex justify-center">
            <BrainLogo size={64} />
          </div>
          <h2 className="landing-display relative mt-6 text-4xl leading-none md:text-6xl">
            Ready to count the damage?
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-secondary">
            Sign in, install the bubble, invite a friend who scrolls worse than you,
            and fight for the crown of least rot.
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn-primary !px-10 !py-3.5">
              Get started with Google
            </Link>
          </div>
          <p className="relative mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            Side effects may include touching grass
          </p>
        </div>
      </section>

      <footer className="border-t border-borderline py-8 text-center text-xs text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <BrainLogo size={18} />
            <span>BrainRot Counter</span>
          </div>
          <p>Built for people who open “just one more Short.”</p>
        </div>
      </footer>
    </div>
  );
}
