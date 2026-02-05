"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ReelItem = {
  id: string;
  videoUrl: string;
  hyperfollowUrl?: string;
};

function getYouTubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);

    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.replace("/shorts/", "").split("/")[0]?.trim();
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v")?.trim();
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (u.pathname.startsWith("/embed/")) return url;
    }

    return null;
  } catch {
    return null;
  }
}

export default function ReelCarousel({ reels }: { reels: ReelItem[] }) {
  const hasMany = reels.length > 1;
  const listRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const textBtn =
    "inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-800 bg-black px-5 text-sm font-medium text-zinc-100 transition hover:border-[var(--gold)] hover:text-[var(--gold)]";

  const streamBtn =
    "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--gold)] px-5 text-sm font-semibold text-black transition hover:opacity-95";

  const arrowBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-100 transition hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-40";

  const scrollToIndex = (index: number) => {
    const el = listRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(reels.length - 1, index));
    const target = el.querySelector<HTMLElement>(
      `[data-reel-index="${clamped}"]`,
    );
    if (!target) return;
    target.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
    setActiveIndex(clamped);
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      const left = el.scrollLeft;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < children.length; i++) {
        const dist = Math.abs(children[i].offsetLeft - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      setActiveIndex(best);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll as any);
  }, []);

  return (
    <div className="relative w-full rounded-3xl bg-black/70 p-4 shadow-2xl backdrop-blur sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-left text-sm font-medium text-zinc-200">
          Latest
        </div>

        {hasMany ? (
          <div className="flex items-center gap-2">
            <button
              className={arrowBtn}
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex <= 0}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className={arrowBtn}
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex >= reels.length - 1}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={listRef}
        className="mt-4 flex gap-4 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {reels.map((r, idx) => {
          const embed = getYouTubeEmbedUrl(r.videoUrl);

          return (
            <div
              key={r.id}
              data-reel-index={idx}
              className="w-[78vw] max-w-[340px] shrink-0 snap-start"
            >
              <div className="overflow-hidden rounded-3xl bg-black">
                <div className="aspect-[9/16] w-full">
                  {embed ? (
                    <iframe
                      className="h-full w-full"
                      src={embed}
                      title="2ndGen reel"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <a
                      href={r.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full w-full items-center justify-center text-sm font-medium text-zinc-100"
                    >
                      Open video
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <a
                  href={r.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={textBtn}
                >
                  YouTube
                </a>

                {r.hyperfollowUrl ? (
                  <a
                    href={r.hyperfollowUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={streamBtn}
                  >
                    Stream
                  </a>
                ) : (
                  <div className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-800 px-5 text-sm font-medium text-zinc-500">
                    Stream
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMany ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {reels.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={
                i === activeIndex
                  ? "h-2 w-6 rounded-full bg-[var(--gold)]"
                  : "h-2 w-2 rounded-full bg-zinc-700"
              }
              aria-label={`Go to reel ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
