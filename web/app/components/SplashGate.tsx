"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Phase = "logo" | "text";

export default function SplashGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("logo");
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__2NDGEN_SPLASH_DONE__ = false;
    }

    if (pathname !== "/") {
      setVisible(false);
      setReady(true);
      return;
    }

    setReady(false);
    setVisible(true);
    setPhase("logo");

    const finish = () => {
      if (typeof window !== "undefined") {
        (window as any).__2NDGEN_SPLASH_DONE__ = true;
        window.dispatchEvent(new Event("2ndgen:splash-done"));
      }
      setVisible(false);
      setReady(true);
    };

    if (reduceMotion) {
      const t = window.setTimeout(finish, 150);
      return () => window.clearTimeout(t);
    }

    const t1 = window.setTimeout(() => setPhase("text"), 650);
    const t2 = window.setTimeout(finish, 1350);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, reduceMotion]);

  return (
    <>
      <div className={ready ? "" : "invisible pointer-events-none"}>
        {children}
      </div>

      {visible ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
          <div className="relative flex flex-col items-center">
            <div
              className={`transition-all duration-500 ${
                phase === "logo"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              <img
                src="/assets/2ndgenlogo.png"
                alt="2ndGen"
                width={160}
                height={160}
                className="block"
              />
            </div>

            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                phase === "text"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              <div className="font-display text-6xl tracking-tight text-white sm:text-7xl">
                2ndGen
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
