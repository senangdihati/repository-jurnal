import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full rounded-2xl border border-border/60 bg-card/60 p-8 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:bg-card/35 dark:ring-white/10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <FileQuestion className="size-6" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Data yang Anda cari mungkin sudah dihapus atau URL tidak valid.
        </p>
        <div className="mt-7">
          <Link href="/" className={cn(buttonVariants(), "w-full sm:w-auto")}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

