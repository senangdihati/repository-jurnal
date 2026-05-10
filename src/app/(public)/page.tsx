import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";

import { LandingHome } from "@/components/landing/LandingHome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("papers")
    .select(
      "id,title,paper_author,abstract,created_at,profiles(full_name,university)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="size-4" aria-hidden />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                Tidak bisa memuat publikasi
              </h1>
              <p className="text-sm text-slate-600">
                Periksa Supabase URL/key, migrasi database, dan kebijakan RLS.
              </p>
              <p className="pt-2 text-sm text-red-600">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const papers = (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    paper_author: p.paper_author,
    abstract: p.abstract,
    created_at: p.created_at,
    author: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
  }));

  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-24 text-sm text-slate-500">
          Memuat ScholarHub…
        </div>
      }
    >
      <LandingHome papers={papers} />
    </Suspense>
  );
}
