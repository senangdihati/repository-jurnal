"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function extractStoragePathFromPublicUrl(fileUrl: string): string | null {
  // Typical public URL:
  // https://<project>.supabase.co/storage/v1/object/public/pdfs/<path>
  const marker = "/storage/v1/object/public/pdfs/";
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(fileUrl.slice(idx + marker.length));
}

export async function createPaperAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const paper_author = String(formData.get("paper_author") ?? "").trim() || null;
  const abstract = String(formData.get("abstract") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "").trim() || null;
  const doi = String(formData.get("doi") ?? "").trim() || null;
  const file = formData.get("file");

  if (!title) return { ok: false, error: "Judul wajib diisi." } as const;
  if (!(file instanceof File)) return { ok: false, error: "File PDF wajib diunggah." } as const;
  if (file.type !== "application/pdf")
    return { ok: false, error: "File harus berupa PDF." } as const;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, error: "Anda belum login." } as const;

  const paperId = crypto.randomUUID();
  const storagePath = `${user.id}/${paperId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(storagePath, file, { contentType: "application/pdf", upsert: false });

  if (uploadError) return { ok: false, error: uploadError.message } as const;

  const { data: publicUrlData } = supabase.storage.from("pdfs").getPublicUrl(storagePath);
  const fileUrl = publicUrlData.publicUrl;

  const { error: insertError } = await supabase.from("papers").insert({
    id: paperId,
    title,
    paper_author,
    abstract: abstract || null,
    file_url: fileUrl,
    author_id: user.id,
    keywords,
    doi,
    status: "published",
  });

  if (insertError) {
    await supabase.storage.from("pdfs").remove([storagePath]);
    return { ok: false, error: insertError.message } as const;
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updatePaperAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const paper_author = String(formData.get("paper_author") ?? "").trim() || null;
  const abstract = String(formData.get("abstract") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "").trim() || null;
  const doi = String(formData.get("doi") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "published").trim();
  const safeStatus = status === "draft" ? "draft" : "published";

  if (!id) return { ok: false, error: "Paper id tidak valid." } as const;
  if (!title) return { ok: false, error: "Judul wajib diisi." } as const;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Anda belum login." } as const;

  const { error } = await supabase
    .from("papers")
    .update({
      title,
      paper_author,
      abstract: abstract || null,
      keywords,
      doi,
      status: safeStatus,
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { ok: false, error: error.message } as const;

  revalidatePath("/");
  revalidatePath(`/papers/${id}`);
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function deletePaperAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Paper id tidak valid." } as const;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Anda belum login." } as const;

  const { data: paper, error: readError } = await supabase
    .from("papers")
    .select("id,file_url")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (readError) return { ok: false, error: readError.message } as const;
  if (!paper) return { ok: false, error: "Paper tidak ditemukan." } as const;

  const { error: deleteError } = await supabase
    .from("papers")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (deleteError) return { ok: false, error: deleteError.message } as const;

  const storagePath = extractStoragePathFromPublicUrl(paper.file_url);
  if (storagePath) {
    await supabase.storage.from("pdfs").remove([storagePath]);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

