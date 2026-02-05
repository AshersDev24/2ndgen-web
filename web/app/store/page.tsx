export default function StorePage() {
  const storeEnabled = process.env.NEXT_PUBLIC_STORE_ENABLED === "true";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-4xl tracking-tight text-zinc-50 sm:text-5xl">
          Store
        </h1>

        {!storeEnabled ? (
          <div className="text-sm text-zinc-300">Coming soon.</div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-black p-5 text-sm text-zinc-300">
            Store is live.
          </div>
        )}
      </div>
    </div>
  );
}
