import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function PendingVerificationPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/pending-verification");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const status = profile?.verification_status ?? "pending";
  if (status === "approved") redirect("/dashboard");

  const rejected = sp.status === "rejected" || status === "rejected";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
      <Card className="border-forest/15 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">
            {rejected ? "Pendaftaran ditolak" : "Menunggu verifikasi"}
          </CardTitle>
          <CardDescription>
            {rejected
              ? "Akun Anda tidak disetujui. Hubungi administrator jika ini kesalahan."
              : "Administrator akan meninjau pendaftaran Anda. Anda akan mendapat akses dashboard setelah disetujui."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Email:</span>{" "}
            {profile?.email ?? user.email ?? "—"}
          </p>
          {profile?.full_name ? (
            <p>
              <span className="font-medium text-foreground">Nama:</span> {profile.full_name}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Beranda
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Keluar
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
