"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type PaperCiteButtonProps = {
  title: string;
  author: string;
  year: string;
};

export function PaperCiteButton({ title, author, year }: PaperCiteButtonProps) {
  const apa = `${author} (${year}). ${title}. ScholarHub Repository.`;

  return (
    <Button
      type="button"
      variant="outline"
      className="inline-flex w-full items-center justify-center gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(apa);
          toast.success("Sitasi disalin ke clipboard.");
        } catch {
          toast.error("Tidak bisa menyalin teks.");
        }
      }}
    >
      <Copy className="size-4" aria-hidden />
      Cite
    </Button>
  );
}
