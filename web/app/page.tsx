"use client";

import Link from "next/link";
import { Instagram, Music2, Youtube, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import ReelCarousel, { ReelItem } from "./components/ReelCarousel";
import SignupModal from "./components/SignupModal";

const REELS: ReelItem[] = [
  {
    id: "demo-1",
    videoUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    hyperfollowUrl: "https://distrokid.com/hyperfollow/demo/link1",
  },
  {
    id: "demo-2",
    videoUrl: "https://www.youtube.com/shorts/9bZkp7q19f0",
    hyperfollowUrl: "https://distrokid.com/hyperfollow/demo/link2",
  },
  {
    id: "demo-3",
    videoUrl: "https://www.youtube.com/shorts/3JZ_D3ELwOQ",
  },
];

export default function Home() {
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    const key = "2ndgen_join_modal_seen";

    const openOnce = () => {
      try {
        const seen = window.sessionStorage.getItem(key);
        if (!seen) {
          window.sessionStorage.setItem(key, "1");
          setJoinOpen(true);
        }
      } catch {
        setJoinOpen(true);
      }
    };

    const splashDone = Boolean((window as any).__2NDGEN_SPLASH_DONE__);

    if (splashDone) {
      openOnce();
      return;
    }

    window.addEventListener("2ndgen:splash-done", openOnce, { once: true });

    return () => {
      window.removeEventListener("2ndgen:splash-done", openOnce as any);
    };
  }, []);

  const iconBtn =
    "rounded-2xl border border-zinc-800 bg-black p-3 text-zinc-100 transition hover:border-[var(--gold)] hover:text-[var(--gold)]";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="relative flex flex-col items-center gap-10 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div
            className="mt-2 h-[460px] w-full max-w-[620px] opacity-[0.08] blur-[0.2px]"
            style={{
              backgroundImage: "url(/assets/2ndgenlogo.png)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center top",
              backgroundSize: "380px",
            }}
          />
        </div>

        <div className="relative flex w-full flex-col items-center gap-6">
          <h1 className="font-display text-7xl tracking-tight text-zinc-50 sm:text-8xl">
            2ndGen
          </h1>

          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/2ndgenuk?igsh=bWw0M2kwdHpsbWMx&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              className={iconBtn}
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>

            <a
              href="https://www.tiktok.com/@2ndgenofficial?_r=1&_t=ZN-93OVDbmDYzG"
              target="_blank"
              rel="noreferrer"
              className={iconBtn}
              aria-label="TikTok"
            >
              <Music2 size={22} />
            </a>

            <a
              href="https://www.youtube.com/@2ndGenOfficial/featured"
              target="_blank"
              rel="noreferrer"
              className={iconBtn}
              aria-label="YouTube"
            >
              <Youtube size={22} />
            </a>

            <Link href="/contact" className={iconBtn} aria-label="Contact">
              <Mail size={22} />
            </Link>
          </div>

          <div className="mt-3 flex w-full max-w-xl flex-col items-center gap-3">
            <div className="text-sm text-zinc-300">
              Join the mailing list for announcements, drops, and new releases.
            </div>
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="h-11 rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:opacity-95"
            >
              Join
            </button>
          </div>
        </div>

        {REELS.length > 0 ? <ReelCarousel reels={REELS} /> : null}

        <SignupModal open={joinOpen} onOpenChange={setJoinOpen} />
      </section>
    </div>
  );
}
