"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBasket, Mail, Menu, X } from "lucide-react";

const pill =
  "inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-black px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-[var(--gold)] hover:text-[var(--gold)]";

export default function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const storeEnabled = useMemo(
    () => process.env.NEXT_PUBLIC_STORE_ENABLED === "true",
    [],
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative">
      <nav className="hidden items-center gap-2 sm:flex">
        {storeEnabled ? (
          <Link href="/store" className={pill}>
            <ShoppingBasket size={18} />
            Store
          </Link>
        ) : null}

        <Link href="/contact" className={pill}>
          <Mail size={18} />
          Contact
        </Link>
      </nav>

      <button
        className="inline-flex items-center justify-center rounded-2xl border border-zinc-800 bg-black p-3 text-zinc-100 hover:border-[var(--gold)] hover:text-[var(--gold)] sm:hidden"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open ? (
        <div className="absolute right-0 top-14 w-48 overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl sm:hidden">
          {storeEnabled ? (
            <Link
              href="/store"
              className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-100 hover:bg-zinc-900"
            >
              <ShoppingBasket size={18} />
              Store
            </Link>
          ) : null}

          <Link
            href="/contact"
            className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-100 hover:bg-zinc-900"
          >
            <Mail size={18} />
            Contact
          </Link>
        </div>
      ) : null}
    </div>
  );
}
