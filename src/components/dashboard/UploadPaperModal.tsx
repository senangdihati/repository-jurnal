"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { createPaperAction } from "@/app/actions/papers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type UploadPaperModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UploadPaperModal({ open, onOpenChange }: UploadPaperModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending) return;
    setProgress(8);
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + 6));
    }, 140);
    return () => window.clearInterval(id);
  }, [isPending]);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setDragOver(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">Upload Paper</DialogTitle>
          <DialogDescription>
            Lengkapi metadata dan unggah file PDF. Progress di bawah mensimulasikan proses
            unggah.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            setProgress(0);
            startTransition(async () => {
              const res = await createPaperAction(fd);
              if (res && "ok" in res && res.ok) {
                setProgress(100);
                toast.success("Paper berhasil diunggah.");
                form.reset();
                onOpenChange(false);
                router.refresh();
                router.push("/dashboard");
              } else if (res && "ok" in res && !res.ok) {
                setProgress(0);
                toast.error(res.error);
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="modal-title">Paper Title</Label>
            <Input id="modal-title" name="title" required className="bg-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-paper-author">Author</Label>
            <Input
              id="modal-paper-author"
              name="paper_author"
              placeholder="e.g. Dr. Jane Doe"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-abstract">Abstract</Label>
            <Textarea
              id="modal-abstract"
              name="abstract"
              rows={5}
              className="resize-y bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-keywords">Keywords</Label>
            <Input
              id="modal-keywords"
              name="keywords"
              placeholder="mis. machine learning; NLP; Indonesia"
              className="bg-white"
            />
            <p className="text-xs text-muted-foreground">Pisahkan dengan titik koma atau koma.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-doi">DOI (opsional)</Label>
            <Input id="modal-doi" name="doi" placeholder="10.xxxx/xxxxx" className="bg-white" />
          </div>
          <div className="space-y-2">
            <Label>PDF file</Label>
            <input ref={fileInputRef} name="file" type="file" accept="application/pdf" required className="sr-only" />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (!f || !fileInputRef.current) return;
                const dt = new DataTransfer();
                dt.items.add(f);
                fileInputRef.current.files = dt.files;
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center text-sm transition-colors",
                dragOver
                  ? "border-sage bg-sage/10"
                  : "border-sage/35 bg-cream-soft/80 hover:border-forest/35",
              )}
            >
              <UploadCloud className="mb-2 size-8 text-forest" aria-hidden />
              <span className="font-medium text-foreground">Seret & lepas PDF di sini</span>
              <span className="mt-1 text-xs text-muted-foreground">atau klik untuk memilih file</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{isPending ? `${progress}%` : progress === 100 ? "Selesai" : "0%"}</span>
            </div>
            <Progress value={isPending || progress === 100 ? progress : 0} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gold font-semibold text-cta-foreground hover:bg-gold-hover"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
