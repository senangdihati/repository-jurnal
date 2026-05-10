import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Download } from "lucide-react";

import { PaperCiteButton } from "@/components/papers/PaperCiteButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PLACEHOLDER_ABSTRACT = `This document presents a scholarly contribution to the field. The work synthesizes prior research, articulates a clear research question, and proposes a methodological approach suitable for empirical validation. Results are discussed in relation to existing literature, with attention to limitations, generalizability, and avenues for future inquiry.

The abstract is intentionally long to demonstrate comfortable reading rhythm on the repository detail page. In production, this block is replaced by the author-provided abstract when available.`;

export default async function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("papers")
    .select(
      "id,title,paper_author,abstract,file_url,created_at,keywords,doi,status,profiles(full_name,university)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const author = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  const authorName =
    data.paper_author?.trim() || author?.full_name?.trim() || "Unknown author";
  const authorHref =
    authorName && authorName !== "Unknown author"
      ? `/?author=${encodeURIComponent(authorName)}`
      : "/";

  const year = new Date(data.created_at).getFullYear().toString();
  const keywordList =
    data.keywords
      ?.split(/[,;]/)
      .map((k) => k.trim())
      .filter(Boolean) ?? [];

  const { data: relatedRows } = await supabase
    .from("papers")
    .select("id,title,paper_author,created_at,profiles(full_name)")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(6);

  const related = (relatedRows ?? [])
    .filter((r) => r.id !== data.id)
    .slice(0, 3);

  const abstractText = data.abstract?.trim() ? data.abstract : PLACEHOLDER_ABSTRACT;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost" }), "w-fit text-slate-700")}
        >
          ← Kembali ke ScholarHub
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-10">
        <div className="space-y-8 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                <CalendarDays className="size-3.5" aria-hidden />
                <time dateTime={data.created_at}>
                  {new Date(data.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </span>
              <Badge className="border border-gold-hover/45 bg-gold font-semibold text-cta-foreground shadow-sm">
                PDF
              </Badge>
              {data.status === "draft" ? (
                <Badge variant="secondary" className="border border-slate-200">
                  Draft
                </Badge>
              ) : null}
            </div>

            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {data.title}
            </h1>

            <p className="mt-3 text-sm text-slate-600">
              Oleh{" "}
              <Link href={authorHref} className="font-medium text-forest hover:underline">
                {authorName}
              </Link>
              {author?.university ? (
                <span className="text-slate-500"> · {author.university}</span>
              ) : null}
            </p>

            <Separator className="my-8" />

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Abstract
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
                {abstractText}
              </p>
            </section>

            <section className="mt-8 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Keywords
              </h2>
              {keywordList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywordList.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="border border-slate-200 bg-slate-50 font-normal text-slate-700"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">—</p>
              )}
            </section>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Related Papers</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map((r) => {
                const ra = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                const relatedAuthor =
                  r.paper_author?.trim() || ra?.full_name?.trim() || "Unknown";
                return (
                  <Link key={r.id} href={`/papers/${r.id}`} className="group block">
                    <Card className="h-full border-forest/15 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-md">
                      <CardHeader className="p-4">
                        <CardTitle className="line-clamp-2 text-left text-sm font-semibold leading-snug text-card-foreground group-hover:text-forest">
                          {r.title}
                        </CardTitle>
                        <p className="text-left text-xs text-slate-500">
                          {relatedAuthor} ·{" "}
                          {new Date(r.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {related.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada paper terkait lainnya.</p>
            ) : null}
          </section>

          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 py-4">
              <CardTitle className="text-base font-semibold text-slate-900">PDF preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-[4/5] w-full bg-slate-100">
                <iframe title="PDF Viewer" src={data.file_url} className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:col-span-3">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="space-y-3 p-5">
              <a
                href={data.file_url}
                download
                className={cn(
                  buttonVariants(),
                  "inline-flex h-11 w-full items-center justify-center gap-2 bg-gold text-base font-semibold text-cta-foreground hover:bg-gold-hover",
                )}
              >
                <Download className="size-4" aria-hidden />
                Download PDF
              </a>
              <PaperCiteButton title={data.title} author={authorName} year={year} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 text-sm">
              <div className="flex justify-between gap-3 border-b border-slate-100 py-2">
                <span className="text-slate-500">Author</span>
                <span className="max-w-[60%] text-right font-medium text-slate-800">
                  {authorName}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-b border-slate-100 py-2">
                <span className="text-slate-500">Publication date</span>
                <span className="text-right font-medium text-slate-800">
                  {new Date(data.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-b border-slate-100 py-2">
                <span className="text-slate-500">University</span>
                <span className="text-right font-medium text-slate-800">
                  {author?.university ?? "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <span className="text-slate-500">DOI</span>
                <span className="max-w-[60%] break-all text-right font-medium text-slate-800">
                  {data.doi?.trim() ? data.doi : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
