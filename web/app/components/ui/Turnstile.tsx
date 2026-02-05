"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: any) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileHandle = {
  execute: () => Promise<string>;
  reset: () => void;
  isReady: () => boolean;
};

type Props = {
  siteKey: string;
  name?: string;
};

async function waitForTurnstile(timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window.turnstile) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

async function waitForWidgetId(getId: () => string | null, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (getId()) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

function short(s: string) {
  if (!s) return s;
  return s.length > 20 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s;
}

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile(
  { siteKey, name = "turnstile" },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pendingResolveRef = useRef<((token: string) => void) | null>(null);
  const pendingTimerRef = useRef<number | null>(null);
  const renderPromiseRef = useRef<Promise<void> | null>(null);

  const [ready, setReady] = useState(false);

  const isConfigured = useMemo(
    () => siteKey && siteKey.trim().length > 0,
    [siteKey],
  );

  const log = (...args: any[]) => console.log(`[${name}]`, ...args);

  const cleanupPending = (reason: string) => {
    if (pendingTimerRef.current) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    if (pendingResolveRef.current) log("cleanupPending:", reason);
    pendingResolveRef.current = null;
  };

  const ensureRendered = async (reason: string) => {
    if (!isConfigured) {
      log("not configured; siteKey missing");
      return;
    }

    if (widgetIdRef.current) {
      setReady(true);
      return;
    }

    if (renderPromiseRef.current) {
      log("ensureRendered join existing render", reason);
      await renderPromiseRef.current;
      return;
    }

    renderPromiseRef.current = (async () => {
      log("ensureRendered start", reason, "siteKey:", short(siteKey));

      const ok = await waitForTurnstile(6000);
      if (!ok || !window.turnstile) {
        log("turnstile not available after wait");
        return;
      }

      if (!containerRef.current) {
        log("container missing");
        return;
      }

      if (widgetIdRef.current) {
        setReady(true);
        return;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          size: "normal",
          appearance: "execute",
          execution: "execute",
          callback: (token: string) => {
            log(
              "callback token received:",
              token ? `${token.slice(0, 12)}…` : "",
            );
            const r = pendingResolveRef.current;
            cleanupPending("callback");
            if (r) r(token);
            else log("callback fired but no pending promise (token dropped)");
          },
          "error-callback": () => {
            log("error-callback");
            const r = pendingResolveRef.current;
            cleanupPending("error-callback");
            if (r) r("");
          },
          "expired-callback": () => {
            log("expired-callback");
            const r = pendingResolveRef.current;
            cleanupPending("expired-callback");
            if (r) r("");
          },
          "timeout-callback": () => {
            log("timeout-callback");
            const r = pendingResolveRef.current;
            cleanupPending("timeout-callback");
            if (r) r("");
          },
        });

        widgetIdRef.current = id;
        setReady(true);
        log("rendered widget id:", id);
      } catch (e) {
        log("render threw:", e);
        widgetIdRef.current = null;
        setReady(false);
      }
    })();

    try {
      await renderPromiseRef.current;
    } finally {
      renderPromiseRef.current = null;
    }
  };

  useEffect(() => {
    log("mount");
    let alive = true;

    (async () => {
      await ensureRendered("mount");
      if (!alive) return;
    })();

    return () => {
      alive = false;
      log("unmount cleanup");
      cleanupPending("unmount");
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
      widgetIdRef.current = null;
      setReady(false);
    };
  }, [siteKey, isConfigured]);

  useImperativeHandle(
    ref,
    () => ({
      isReady: () =>
        Boolean(window.turnstile) && Boolean(widgetIdRef.current) && ready,
      execute: () => {
        return new Promise<string>(async (resolve) => {
          log("execute requested");

          if (!isConfigured) return resolve("");

          await ensureRendered("execute");

          const widgetOk = await waitForWidgetId(
            () => widgetIdRef.current,
            3000,
          );

          if (!widgetOk || !window.turnstile || !widgetIdRef.current) {
            log("execute aborted: widget not ready", {
              widgetOk,
              hasTurnstile: Boolean(window.turnstile),
              widgetId: widgetIdRef.current,
            });
            return resolve("");
          }

          cleanupPending("execute:new");
          pendingResolveRef.current = resolve;

          pendingTimerRef.current = window.setTimeout(() => {
            log("execute timeout (no callback received)");
            const r = pendingResolveRef.current;
            cleanupPending("execute:timeout");
            if (r) r("");
          }, 12000);

          try {
            log("reset before execute:", widgetIdRef.current);
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            log("reset threw:", e);
          }

          try {
            log("calling execute:", widgetIdRef.current);
            window.turnstile.execute(widgetIdRef.current);
          } catch (e) {
            log("execute threw:", e);
            cleanupPending("execute:threw");
            resolve("");
          }
        });
      },
      reset: () => {
        log("reset requested");
        cleanupPending("reset:manual");
        if (!window.turnstile || !widgetIdRef.current) {
          log("reset ignored: widget not ready");
          return;
        }
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          log("reset threw:", e);
        }
      },
    }),
    [isConfigured, ready],
  );

  if (!isConfigured) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: 1,
        height: 1,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <div ref={containerRef} />
    </div>
  );
});

export type { TurnstileHandle };
export default Turnstile;
