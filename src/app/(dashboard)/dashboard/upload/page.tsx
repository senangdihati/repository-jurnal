import Link from "next/link";
import { UploadCloud } from "lucide-react";

import { PaperUploadForm } from "@/components/dashboard/PaperUploadForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-10 sm:py-12">
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "ghost" }), "inline-flex w-fit")}
      >
        ← Kembali
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
          <UploadCloud className="size-3.5 text-primary" aria-hidden />
          <span>Unggah dokumen</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">Upload paper</h1>
          <p className="text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
            Simpan PDF ke bucket <span className="font-medium text-foreground">pdfs</span> dan
            catat judul/abstrak ke database.
          </p>
        </div>
      </div>

      <PaperUploadForm />
    </div>
  );
}

