"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, type User } from "@/lib/api";
import { setSession } from "@/lib/auth";
import BrainLogo from "@/components/BrainLogo";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api<{ token: string }>("/auth/register", {
        body: { name, email, password },
      });
      setRegistrationToken(data.token);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api<{ token: string; refresh_token: string; user: User }>(
        "/auth/verify-registration",
        { body: { token: registrationToken, otp } },
      );
      setSession({ token: data.token, refresh_token: data.refresh_token, user: data.user });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <BrainLogo size={44} />
        <h1 className="text-2xl font-bold">
          {step === "details" ? "Create your account" : "Check your email"}
        </h1>
        {step === "otp" && (
          <p className="text-sm text-secondary">
            We sent a 6-digit code to <span className="text-primary">{email}</span>
          </p>
        )}
      </div>

      {step === "details" ? (
        <form onSubmit={submitDetails} className="card space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              required
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={5}
              className="input"
              placeholder="At least 5 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-[color:var(--critical)]">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Sending code…" : "Sign up"}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent-2 hover:underline">
              Login
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="card space-y-4">
          <div>
            <label className="label" htmlFor="otp">Verification code</label>
            <input
              id="otp"
              required
              inputMode="numeric"
              maxLength={6}
              className="input text-center text-2xl font-bold tracking-[0.5em]"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {error && <p className="text-sm text-[color:var(--critical)]">{error}</p>}

          <button type="submit" disabled={busy || otp.length < 6} className="btn-primary w-full">
            {busy ? "Verifying…" : "Verify & create account"}
          </button>

          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() => {
              setStep("details");
              setOtp("");
              setError("");
            }}
          >
            Back
          </button>
        </form>
      )}
    </main>
  );
}
