import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AdminVerificationTable } from "@/components/admin/AdminVerificationTable";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/users");

  const { data: me } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .maybeSingle();

  if (me?.role !== "admin" || me?.verification_status !== "approved") {
    redirect("/dashboard");
  }

  const { data: queue, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, university, verification_status, created_at, role")
    .in("verification_status", ["pending", "rejected"])
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-sage-muted text-forest">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Verifikasi pengguna
            </h1>
            <p className="text-sm text-muted-foreground">
              Setujui atau tolak pendaftaran baru. Hanya akun dengan peran admin yang dapat mengakses
              halaman ini.
            </p>
          </div>
        </div>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
          ← Dashboard
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Gagal memuat antrian: {error.message}. Pastikan migrasi verifikasi sudah dijalankan.
        </p>
      ) : (
        <AdminVerificationTable rows={queue ?? []} />
      )}
    </div>
  );
}
