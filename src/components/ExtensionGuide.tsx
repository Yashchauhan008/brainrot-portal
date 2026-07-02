"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "Get the extension folder",
    detail: (
      <>
        Download / clone the BrainRot project and locate the{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">extension/</code>{" "}
        folder.
      </>
    ),
  },
  {
    title: "Open Chrome extensions",
    detail: (
      <>
        Go to{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">
          chrome://extensions
        </code>{" "}
        and switch on <strong>Developer mode</strong> (top right).
      </>
    ),
  },
  {
    title: "Load it",
    detail: (
      <>
        Click <strong>Load unpacked</strong> and select the{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">extension/</code>{" "}
        folder.
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
        Already installed? Make sure it's enabled in{" "}
        <code className="rounded bg-background px-1.5 py-0.5">chrome://extensions</code>{" "}
        and reload this page — the extension announces itself on page load.
      </p>
    </div>
  );
}
