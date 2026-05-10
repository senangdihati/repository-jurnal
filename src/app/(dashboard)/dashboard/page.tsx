import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MyPaperRow } from "@/components/dashboard/PapersTable";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MOBILE_NAV = [
  { href: "/dashboard", label: "My Papers" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/analytics", label: "Analytics" },
] as const;

const navBtn = cn(buttonVariants({ variant: "outline", size: "sm" }));

type PageProps = { searchParams: Promise<{ upload?: string }> };

export default async function DashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [{ data, error }, { data: profileRow }] = await Promise.all([
    supabase
      .from("papers")
      .select(
        "id,title,paper_author,abstract,file_url,created_at,status,keywords,doi,view_count,download_count",
      )
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  const profileName = profileRow?.full_name?.trim() || null;

  const papers: MyPaperRow[] = (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    paper_author: p.paper_author,
    listing_author: p.paper_author?.trim() || profileName || "—",
    abstract: p.abstract,
    file_url: p.file_url,
    created_at: p.created_at,
    status: p.status ?? "published",
    keywords: p.keywords,
    doi: p.doi,
    view_count: p.view_count ?? 0,
    download_count: p.download_count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <p className="text-sm font-medium text-slate-700">Menu cepat</p>
        <div className="flex flex-wrap gap-2">
          {MOBILE_NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={navBtn}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="size-4" aria-hidden />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Gagal memuat dashboard
              </h2>
              <p className="text-sm text-slate-600">
                Jika error menyebut kolom (mis. <code className="text-xs">paper_author</code>), jalankan
                di Supabase SQL Editor:{" "}
                <code className="break-all text-xs">
                  alter table public.papers add column if not exists paper_author text;
                </code>
              </p>
              <p className="pt-2 text-sm text-red-600">{error.message}</p>
            </div>
          </div>
        </div>
      ) : (
        <DashboardWorkspace
          papers={papers}
          initialUploadOpen={sp.upload === "1"}
        />
      )}
    </div>
  );
}
