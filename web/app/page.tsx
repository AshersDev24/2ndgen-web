"use client";

import { useMemo, useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function Home() {
  const apiBaseUrl = useMemo(() => {
    const v = process.env.NEXT_PUBLIC_API_BASE_URL;
    return v && v.trim().length > 0 ? v.trim().replace(/\/+$/, "") : "";
  }, []);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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

    setStatus({ type: "sending" });

    try {
      const res = await fetch(`${apiBaseUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || null,
          message: form.message.trim(),
        }),
      });

      if (!res.ok) {
        let msg = "Something went wrong. Try again.";
        try {
          const data = (await res.json()) as any;
          if (data?.message) msg = String(data.message);
        } catch {}
        setStatus({ type: "error", message: msg });
        return;
      }

      setStatus({ type: "success" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.message ? String(err.message) : "Network error.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight">
                2ndGen
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Music • Training • Build-in-public
              </span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                New drops monthly. Content weekly.
              </h1>
              <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
                Short-form studio moments, punchy hooks, training clips, and the
                journey of building everything in public.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://open.spotify.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-black"
                >
                  Listen
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  Watch
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  TikTok
                </a>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-sm font-semibold">Latest</div>
                <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  Drop 01 — coming soon.
                </div>
                <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                  This card can be wired to a “releases” table later.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-2">
                <div className="text-lg font-semibold tracking-tight">
                  Contact / updates
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Send a message or join the list for drop notifications.
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Name"
                    className="h-11 rounded-xl border border-zinc-200 bg-transparent px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                    autoComplete="name"
                  />
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="Email"
                    className="h-11 rounded-xl border border-zinc-200 bg-transparent px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, subject: e.target.value }))
                  }
                  placeholder="Subject (optional)"
                  className="h-11 rounded-xl border border-zinc-200 bg-transparent px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                />

                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, message: e.target.value }))
                  }
                  placeholder="Message"
                  className="min-h-[120px] rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                />

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-2 h-11 rounded-xl bg-zinc-900 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
                >
                  {status.type === "sending" ? "Sending..." : "Send"}
                </button>

                {status.type === "success" ? (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">
                    Sent. I’ll get back to you.
                  </div>
                ) : null}

                {status.type === "error" ? (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {status.message}
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </header>

        <footer className="mt-14 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div>© {new Date().getFullYear()} 2ndGen</div>
          <div className="text-xs">
            API: {apiBaseUrl ? apiBaseUrl : "not set"}
          </div>
        </footer>
      </div>
    </div>
  );
}
