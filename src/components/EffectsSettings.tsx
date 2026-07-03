"use client";

import { useEffect, useRef, useState } from "react";
import { api, type Settings } from "@/lib/api";
import { pushSettingsToExtension } from "@/lib/auth";

const TOGGLES: { key: keyof Omit<Settings, "daily_target">; label: string; hint: string }[] = [
  {
    key: "rot_icon_enabled",
    label: "Rotting brain icon",
    hint: "The bubble's brain decays as you pass 1×, 2×, 3× your daily target",
  },
  {
    key: "screen_fade_enabled",
    label: "Screen fade",
    hint: "Past the target, every extra video darkens the reel a little more",
  },
  {
    key: "milestone_popups_enabled",
    label: "Milestone popups",
    hint: "A one-time roast when you cross 2× the target (and every 2× after)",
  },
  {
    key: "hard_block_enabled",
    label: "Hard block",
    hint: "At the target, reels/shorts get fully blocked until the 24h window frees up",
  },
];

export default function EffectsSettings({
  onAuthError,
}: {
  onAuthError: (err: unknown) => boolean;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [targetDraft, setTargetDraft] = useState("");
  const [error, setError] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    api<{ settings: Settings }>("/users/settings")
      .then(({ settings }) => {
        setSettings(settings);
        setTargetDraft(String(settings.daily_target));
        pushSettingsToExtension(settings); // correct any stale copy right away
      })
      .catch((err) => {
        if (!onAuthError(err)) setError("Could not load effect settings.");
      });
  }, [onAuthError]);

  async function save(patch: Partial<Settings>) {
    if (!settings || saving.current) return;
    saving.current = true;
    const previous = settings;
    setSettings({ ...settings, ...patch }); // optimistic
    setError("");

    try {
      const { settings: next } = await api<{ settings: Settings }>("/users/settings", {
        method: "PUT",
        body: patch,
      });
      setSettings(next);
      setTargetDraft(String(next.daily_target));
      pushSettingsToExtension(next);
    } catch (err) {
      setSettings(previous);
      setTargetDraft(String(previous.daily_target));
      if (!onAuthError(err)) setError("Could not save — is the server running?");
    } finally {
      saving.current = false;
    }
  }

  function commitTarget() {
    if (!settings) return;
    const value = Number(targetDraft);
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      setTargetDraft(String(settings.daily_target));
      return;
    }
    if (value !== settings.daily_target) save({ daily_target: value });
  }

  return (
    <div className="card mt-6">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 className="font-semibold">Brainrot effects</h2>
        <label className="ml-auto flex items-center gap-2 text-xs text-muted">
          Daily target
          <input
            type="number"
            min={1}
            max={1000}
            value={targetDraft}
            disabled={!settings}
            onChange={(e) => setTargetDraft(e.target.value)}
            onBlur={commitTarget}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-20 rounded-lg border border-borderline bg-surface-2 px-2.5 py-1.5 text-sm text-primary tabular-nums outline-none focus:border-[color:var(--good)]/60"
          />
        </label>
      </div>
      <p className="mb-5 text-sm text-secondary">
        What the extension does to you as the count climbs. Changes apply instantly.
      </p>

      {error && <p className="mb-4 text-sm text-[color:var(--critical)]">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {TOGGLES.map(({ key, label, hint }) => {
          const enabled = settings?.[key] ?? true;
          return (
            <button
              key={key}
              type="button"
              disabled={!settings}
              onClick={() => save({ [key]: !enabled })}
              className={`rounded-2xl border p-4 text-left transition ${
                enabled
                  ? "border-[color:var(--good)]/40 bg-surface-2"
                  : "border-borderline opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{label}</span>
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition ${
                    enabled ? "bg-[color:var(--good)]" : "bg-borderline"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      enabled ? "left-4.5" : "left-0.5"
                    }`}
                  />
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">{hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
