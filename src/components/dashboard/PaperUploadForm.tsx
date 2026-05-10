"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { createPaperAction } from "@/app/actions/papers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function PaperUploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending) return;
    setProgress(10);
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + 5));
    }, 160);
    return () => window.clearInterval(id);
  }, [isPending]);

  return (
    <Card className="overflow-hidden border-forest/15 bg-card shadow-sm">
      <CardHeader className="space-y-1.5 border-b border-sage/30 bg-sage-muted/40">
        <CardTitle className="text-xl tracking-tight text-foreground">Upload paper</CardTitle>
        <CardDescription>Unggah PDF dan metadata ke ScholarHub.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            setError(null);
            setProgress(0);
            startTransition(async () => {
              const res = await createPaperAction(fd);
              if (res && "ok" in res && res.ok) {
                setProgress(100);
                toast.success("Paper berhasil diunggah.");
                form.reset();
                router.refresh();
                router.push("/dashboard");
              } else if (res && "ok" in res && !res.ok) {
                setProgress(0);
                setError(res.error);
                toast.error(res.error);
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Paper title</Label>
            <Input id="title" name="title" required className="bg-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paper_author">Author</Label>
            <Input
              id="paper_author"
              name="paper_author"
              placeholder="e.g. Dr. Jane Doe; John Smith"
              className="bg-white"
            />
            <p className="text-xs text-muted-foreground">
              Nama penulis publikasi (tampil di halaman detail). Kosongkan untuk memakai nama profil
              Anda.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea id="abstract" name="abstract" rows={6} className="resize-y bg-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              name="keywords"
              placeholder="mis. deep learning; climate; policy"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doi">DOI (opsional)</Label>
            <Input id="doi" name="doi" placeholder="10.xxxx/xxxxx" className="bg-white" />
          </div>
          <div className="space-y-2">
            <Label>PDF file</Label>
            <input
              ref={fileInputRef}
              id="file"
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="sr-only"
            />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") fileInputRef.current?.click();
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(ev) => {
                ev.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(ev) => {
                ev.preventDefault();
                setDragOver(false);
                const f = ev.dataTransfer.files?.[0];
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
              <span className="font-medium text-foreground">Drag & drop PDF</span>
              <span className="mt-1 text-xs text-muted-foreground">or click to browse</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{isPending ? `${progress}%` : progress === 100 ? "Selesai" : "0%"}</span>
            </div>
            <Progress value={isPending || progress === 100 ? progress : 0} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full bg-gold font-semibold text-cta-foreground hover:bg-gold-hover"
            disabled={isPending}
          >
            {isPending ? "Mengunggah..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
