import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/assets/2ndgenlogo.png"
          alt="2ndGen logo"
          width={72}
          height={72}
          priority
        />
        <div className="font-display text-4xl tracking-tight">2ndGen</div>
      </div>
    </div>
  );
}
