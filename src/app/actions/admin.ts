"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAdminContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Belum login." };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (profile?.role !== "admin" || profile?.verification_status !== "approved") {
    return { ok: false as const, error: "Akses ditolak." };
  }

  return { ok: true as const, supabase };
}

export async function approveUserAction(userId: string) {
  const ctx = await getAdminContext();
  if (!ctx.ok) return { ok: false as const, error: ctx.error };

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ verification_status: "approved" })
    .eq("id", userId);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/pending-verification");
  return { ok: true as const };
}

export async function rejectUserAction(userId: string) {
  const ctx = await getAdminContext();
  if (!ctx.ok) return { ok: false as const, error: ctx.error };

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ verification_status: "rejected" })
    .eq("id", userId);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/pending-verification");
  return { ok: true as const };
}
