import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Manrope, Freeman } from "next/font/google";
import "./globals.css";
import SplashGate from "./components/SplashGate";
import HeaderNav from "./components/HeaderNav";
import FooterNav from "./components/FooterNav";

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const display = Freeman({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "2ndGen",
  description: "2ndGen — reels first, releases soon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="antialiased">
        {siteKey.trim().length > 0 ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="beforeInteractive"
          />
        ) : null}

        <SplashGate>
          <div className="min-h-screen bg-black text-zinc-50">
            <header className="sticky top-0 z-50 bg-black/70 backdrop-blur">
              <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
                <Link href="/" className="flex items-center gap-3">
                  <img
                    src="/assets/2ndgenlogo.png"
                    alt="2ndGen logo"
                    width={36}
                    height={36}
                    className="block h-9 w-9"
                  />
                  <span className="font-display text-lg tracking-tight text-zinc-50">
                    2ndGen
                  </span>
                </Link>

                <HeaderNav />
              </div>
            </header>

            <main>{children}</main>

            <footer className="py-10 text-sm text-zinc-400">
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
                <div>© {new Date().getFullYear()} 2ndGen</div>
                <FooterNav />
              </div>
            </footer>
          </div>
        </SplashGate>
      </body>
    </html>
  );
}
