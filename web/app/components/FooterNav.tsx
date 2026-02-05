"use client";

import Link from "next/link";
import { useMemo } from "react";

export default function FooterNav() {
  const storeEnabled = useMemo(
    () => process.env.NEXT_PUBLIC_STORE_ENABLED === "true",
    [],
  );

  return (
    <div className="flex items-center gap-4">
      {storeEnabled ? (
        <Link href="/store" className="hover:text-[var(--gold)]">
          Store
        </Link>
      ) : null}

      <Link href="/contact" className="hover:text-[var(--gold)]">
        Contact
      </Link>
    </div>
  );
}
