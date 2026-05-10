import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:bg-card/40 dark:ring-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}

