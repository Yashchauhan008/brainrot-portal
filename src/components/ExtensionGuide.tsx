"use client";

import { useEffect, useState } from "react";

const EXTENSION_REPO = "https://github.com/Yashchauhan008/brainrot-extension";
const EXTENSION_ZIP = `${EXTENSION_REPO}/archive/refs/heads/main.zip`;
const CHROME_EXTENSIONS_URL = "chrome://extensions";

function ChromeExtensionsLink({
  className = "",
}: {
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Chrome blocks navigating to chrome:// from https pages — copy instead.
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(CHROME_EXTENSIONS_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard is blocked
      window.prompt("Copy this and paste it in the address bar:", CHROME_EXTENSIONS_URL);
    }
  }

  return (
    <a
      href={CHROME_EXTENSIONS_URL}
      onClick={handleClick}
      title="Click to copy — paste in Chrome’s address bar"
      className={`font-semibold text-accent-2 underline underline-offset-2 hover:brightness-110 ${className}`}
    >
      {copied ? "Copied! Paste in the address bar" : "chrome://extensions"}
    </a>
  );
}

const STEPS = [
  {
    title: "Get the extension",
    detail: (
      <>
        <a
          href={EXTENSION_ZIP}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-2 underline underline-offset-2 hover:brightness-110"
        >
          Download the ZIP
        </a>{" "}
        or clone{" "}
        <a
          href={EXTENSION_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-2 underline underline-offset-2 hover:brightness-110"
        >
          github.com/Yashchauhan008/brainrot-extension
        </a>
        , then unzip it.
      </>
    ),
  },
  {
    title: "Open Chrome extensions",
    detail: (
      <>
        Go to <ChromeExtensionsLink /> and switch on{" "}
        <strong>Developer mode</strong> (top right).
      </>
    ),
  },
  {
    title: "Load it",
    detail: (
      <>
        Click <strong>Load unpacked</strong> and select the unzipped folder (the
        one that contains{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">
          manifest.json
        </code>
        ).
      </>
    ),
  },
  {
    title: "Reload this page",
    detail: (
      <>
        The badge above should turn into <strong>🧩 Extension connected</strong> —
        then open Reels or Shorts and watch the brain rot.
      </>
    ),
  },
];

// Rendered on the dashboard when the extension hasn't announced itself.
// The handshake takes a moment after page load, so wait before concluding
// it's actually missing — otherwise the guide flashes for everyone.
export default function ExtensionGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="card mb-6 border-[color:var(--critical)]/30">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold">🧩 Extension not detected — set it up</h2>
        <button
          onClick={() => window.location.reload()}
          className="btn-ghost ml-auto !px-4 !py-1.5 text-xs"
        >
          I installed it — recheck
        </button>
      </div>
      <p className="mt-1 text-sm text-secondary">
        Without the extension nothing gets counted. Takes about a minute:
      </p>

      <ol className="mt-5 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold">
              {i + 1}
            </span>
            <div>
              <div className="text-sm font-medium">{step.title}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-xs text-muted">
        Already installed? Make sure it&apos;s enabled in <ChromeExtensionsLink />{" "}
        and reload this page — the extension announces itself on page load. Repo:{" "}
        <a
          href={EXTENSION_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-2 underline underline-offset-2"
        >
          brainrot-extension
        </a>
        .
      </p>
    </div>
  );
}
