"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ClientOnly from "./ClientOnly";
import Modal from "./ui/Modal";
import Turnstile, { TurnstileHandle } from "./ui/Turnstile";

function isValidEmail(value: string) {
  const v = value.trim();
  if (!v) return false;
  if (v.length > 254) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(v);
}

type SignupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function normalizeApiBaseUrl(input: string) {
  const base = input.trim().replace(/\/+$/, "");
  if (!base) return "";
  if (base.endsWith("/api")) return base;
  return `${base}/api`;
}

export default function SignupModal({ open, onOpenChange }: SignupModalProps) {
  const apiBaseUrl = useMemo(() => {
    const v = process.env.NEXT_PUBLIC_API_BASE_URL;
    return v && v.trim().length > 0 ? normalizeApiBaseUrl(v) : "";
  }, []);

  const siteKey = useMemo(() => {
    const v = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    return v && v.trim().length > 0 ? v.trim() : "";
  }, []);

  const turnstileEnabled = useMemo(() => {
    const v = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED;
    return (v || "").trim().toLowerCase() === "true";
  }, []);

  const turnstileRef = useRef<TurnstileHandle | null>(null);

  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "sending" }
    | { type: "success" }
    | { type: "error"; message: string }
  >({ type: "idle" });

  useEffect(() => {
    if (!open) return;
    setStatus({ type: "idle" });
    setTouched(false);
    setHp("");
    if (turnstileEnabled) turnstileRef.current?.reset();
  }, [open, turnstileEnabled]);

  const emailTrimmed = email.trim();
  const emailOk = isValidEmail(emailTrimmed);
  const showEmailError = touched && emailTrimmed.length > 0 && !emailOk;
  const canSubmit = status.type !== "sending" && emailOk;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    if (!apiBaseUrl) {
      setStatus({
        type: "error",
        message: "API not set. Add NEXT_PUBLIC_API_BASE_URL in web/.env.local.",
      });
      return;
    }

    if (!emailOk) {
      setStatus({ type: "error", message: "Enter a valid email address." });
      return;
    }

    if (hp.trim().length > 0) {
      setStatus({ type: "error", message: "Invalid submission." });
      return;
    }

    if (turnstileEnabled && !siteKey) {
      setStatus({ type: "error", message: "Turnstile not configured." });
      return;
    }

    setStatus({ type: "sending" });

    let token: string | undefined;

    if (turnstileEnabled) {
      token = await turnstileRef.current?.execute();

      if (!token) {
        setStatus({
          type: "error",
          message:
            "Verification didn’t complete. Please try again (Turnstile didn’t return a token).",
        });
        turnstileRef.current?.reset();
        return;
      }
    }

    try {
      const res = await fetch(`${apiBaseUrl}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrimmed,
          hp,
          turnstile_token: turnstileEnabled ? token : null,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          typeof payload === "string"
            ? payload.slice(0, 200)
            : payload?.message
              ? String(payload.message)
              : `Request failed (${res.status}).`;
        setStatus({ type: "error", message: msg });
        if (turnstileEnabled) turnstileRef.current?.reset();
        return;
      }

      setStatus({ type: "success" });
      setEmail("");
      setHp("");
      setTouched(false);
      if (turnstileEnabled) turnstileRef.current?.reset();
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.message ? String(err.message) : "Network error.",
      });
      if (turnstileEnabled) turnstileRef.current?.reset();
    }
  }

  return (
    <ClientOnly>
      <Modal open={open} onClose={() => onOpenChange(false)} title="Join">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="text-sm text-zinc-300">
            Join the mailing list for announcements, new releases, drops, and
            updates.
          </div>

          <div className="hidden" aria-hidden="true">
            <label className="text-sm font-medium text-zinc-100">
              Leave this field empty
            </label>
            <input
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              name="hp"
              autoComplete="off"
              tabIndex={-1}
              className="h-12 rounded-2xl border border-zinc-800 bg-black px-4 text-sm text-zinc-50 outline-none md:h-11"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status.type !== "idle") setStatus({ type: "idle" });
              }}
              onBlur={() => setTouched(true)}
              placeholder="Email address"
              className={`h-12 flex-1 rounded-2xl border bg-black px-4 text-sm text-zinc-50 outline-none sm:h-11 ${
                showEmailError
                  ? "border-red-500 focus:border-red-400"
                  : "border-zinc-800 focus:border-[var(--gold)]/70"
              }`}
              autoComplete="email"
              inputMode="email"
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="h-12 rounded-2xl bg-[var(--gold)] px-6 text-sm font-semibold text-black hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11"
            >
              {status.type === "sending" ? "Joining..." : "Join"}
            </button>
          </div>

          {turnstileEnabled ? (
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              name="turnstile:signup"
            />
          ) : null}

          {showEmailError ? (
            <div className="text-sm text-red-400">
              Enter a valid email address.
            </div>
          ) : null}

          {status.type === "success" ? (
            <div className="text-sm text-[var(--gold)]">You’re in.</div>
          ) : null}

          {status.type === "error" ? (
            <div className="text-sm text-red-400">{status.message}</div>
          ) : null}
        </form>
      </Modal>
    </ClientOnly>
  );
}
