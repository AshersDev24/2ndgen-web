"use client";

import { useMemo, useRef, useState } from "react";
import ClientOnly from "../components/ClientOnly";
import Turnstile, { TurnstileHandle } from "../components/ui/Turnstile";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const SUBJECT_OPTIONS = [
  "Mixing & Mastering",
  "Producing",
  "Collaboration",
  "Booking / Performance",
  "Other",
] as const;

function normalizeApiBaseUrl(input: string) {
  const base = input.trim().replace(/\/+$/, "");
  if (!base) return "";
  if (base.endsWith("/api")) return base;
  return `${base}/api`;
}

export default function ContactPage() {
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

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });

  const [hp, setHp] = useState("");

  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "sending" }
    | { type: "success" }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const canSubmit =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.message.trim().length > 0 &&
    status.type !== "sending";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!apiBaseUrl) {
      setStatus({
        type: "error",
        message:
          "API base URL not set. Add NEXT_PUBLIC_API_BASE_URL in web/.env.local.",
      });
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
        setStatus({ type: "error", message: "Turnstile verification failed." });
        turnstileRef.current?.reset();
        return;
      }
    }

    try {
      const res = await fetch(`${apiBaseUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
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
      setForm({
        name: "",
        email: "",
        subject: SUBJECT_OPTIONS[0],
        message: "",
      });
      setHp("");
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
    <div className="mx-auto w-full max-w-3xl px-6 py-14">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-5xl tracking-tight text-zinc-50 sm:text-6xl">
          Contact
        </h1>
        <p className="text-sm leading-6 text-zinc-300">
          For mixing & mastering, producing, collabs, or anything else — send a
          message and I’ll get back to you.
        </p>
      </div>

      <ClientOnly>
        <div className="mt-8 rounded-3xl bg-black/70 p-6 shadow-2xl backdrop-blur">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-100">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      name: e.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border border-zinc-800 bg-black px-4 text-sm text-zinc-50 outline-none focus:border-[var(--gold)]/70 md:h-11"
                  autoComplete="name"
                  placeholder="Your name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-100">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      email: e.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border border-zinc-800 bg-black px-4 text-sm text-zinc-50 outline-none focus:border-[var(--gold)]/70 md:h-11"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-100">
                Subject
              </label>
              <select
                value={form.subject}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    subject: e.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-zinc-800 bg-black px-4 text-sm text-zinc-50 outline-none focus:border-[var(--gold)]/70 md:h-11"
              >
                {SUBJECT_OPTIONS.map((o) => (
                  <option key={o} value={o} className="bg-black text-zinc-50">
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-100">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    message: e.target.value,
                  }))
                }
                className="min-h-[160px] rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-50 outline-none focus:border-[var(--gold)]/70"
                placeholder="Tell me what you need, timelines, references, budget if relevant."
              />
            </div>

            {turnstileEnabled ? (
              <Turnstile ref={turnstileRef} siteKey={siteKey} />
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 h-12 rounded-2xl bg-[var(--gold)] text-sm font-semibold text-black hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 md:h-11"
            >
              {status.type === "sending" ? "Sending..." : "Send"}
            </button>

            {status.type === "success" ? (
              <div className="text-sm text-[var(--gold)]">
                Sent. I’ll get back to you.
              </div>
            ) : null}

            {status.type === "error" ? (
              <div className="text-sm text-red-400">{status.message}</div>
            ) : null}
          </form>
        </div>
      </ClientOnly>
    </div>
  );
}
