"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type LandingPaper = {
  id: string;
  title: string;
  paper_author?: string | null;
  created_at: string;
  author?: {
    full_name: string | null;
    university: string | null;
  } | null;
};

function publicationAuthorName(p: LandingPaper): string {
  const fromPaper = p.paper_author?.trim();
  if (fromPaper) return fromPaper;
  const fromProfile = p.author?.full_name?.trim();
  if (fromProfile) return fromProfile;
  return "";
}

type LandingHomeProps = {
  papers: LandingPaper[];
};

export function LandingHome({ papers }: LandingHomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authorFromUrl = searchParams.get("author") ?? "";

  const [query, setQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState(authorFromUrl);

  useEffect(() => {
    setAuthorFilter(authorFromUrl);
  }, [authorFromUrl]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const a = authorFilter.trim().toLowerCase();
    return papers.filter((p) => {
      const titleOk = !q || p.title.toLowerCase().includes(q);
      const authorName = publicationAuthorName(p).toLowerCase();
      const authorOk = !a || authorName.includes(a);
      return titleOk && authorOk;
    });
  }, [papers, query, authorFilter]);

  const recent = filtered;

  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-sage/35 bg-cream-soft/95 py-14 shadow-sm backdrop-blur-sm sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-medium tracking-wide text-forest">
            MTSN 4 JAKARTA repository
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Hasil Riset MTSN 4 JAKARTA
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Telusuri publikasi ilmiah, baca abstrak, dan akses PDF
          </p>

          <form
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
            }}
            role="search"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-sage"
                aria-hidden
              />
              <Input
                className="h-14 rounded-xl border-sage/40 bg-card pl-12 pr-4 text-base shadow-sm ring-sage/15 placeholder:text-muted-foreground focus-visible:border-forest/45 focus-visible:ring-sage/30"
                placeholder="Cari judul publikasi..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (authorFromUrl || authorFilter) {
                    setAuthorFilter("");
                    router.replace("/", { scroll: false });
                  }
                }}
                aria-label="Cari judul"
              />
            </div>
            <Button
              type="submit"
              className="h-14 shrink-0 rounded-xl bg-gold px-8 text-base font-semibold text-cta-foreground shadow-md hover:bg-gold-hover"
            >
              Search
            </Button>
          </form>
          {authorFilter ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Menyaring penulis:{" "}
              <span className="font-medium text-foreground">{authorFilter}</span>{" "}
              <Link href="/" className="font-medium text-forest underline-offset-4 hover:underline">
                Hapus filter
              </Link>
            </p>
          ) : null}
        </div>
       
      </section>
      

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:py-14">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Recent Publications
            </h2>
            <p className="text-sm text-muted-foreground">
              Entri terbaru dari repositori. Klik kartu untuk detail dan pratinjau PDF.
            </p>
          </div>
          <Link
            href="/dashboard/upload"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-forest/25 text-forest hover:bg-sage-muted/60",
            )}
          >
            Unggah publikasi
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {recent.map((paper) => {
            const authorName = publicationAuthorName(paper) || "Unknown author";
            const authorHref =
              authorName && authorName !== "Unknown author"
                ? `/?author=${encodeURIComponent(authorName)}`
                : "/";

            return (
              <Card
                key={paper.id}
                className="h-full border-forest/15 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-sage/45 hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/papers/${paper.id}`} className="group block flex-1">
                      <h3 className="text-left text-base font-bold leading-snug tracking-tight text-card-foreground group-hover:text-forest">
                        {paper.title}
                      </h3>
                    </Link>
                    <Badge
                      variant="secondary"
                      className="shrink-0 border border-gold-hover/40 bg-gold text-cta-foreground font-semibold shadow-sm"
                    >
                      PDF
                    </Badge>
                  </div>
                  <Link
                    href={authorHref}
                    className="w-fit text-left text-sm text-muted-foreground underline-offset-2 hover:text-forest hover:underline"
                  >
                    {authorName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Date(paper.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <Link
                    href={`/papers/${paper.id}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "-ml-2 w-fit px-2 text-forest hover:bg-sage/15",
                    )}
                  >
                    Lihat detail
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {recent.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-sage/45 bg-card/90 px-6 py-14 text-center text-sm text-muted-foreground">
            Tidak ada publikasi yang cocok dengan pencarian Anda.
          </div>
        ) : null}
      </section>
    </div>
  );
}
