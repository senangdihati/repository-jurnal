import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Hapus impor ./env karena ini yang menyebabkan error di Edge Runtime
// import { getSupabaseEnv } from "./env"; 
import type { Database } from "./types";

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  // Ambil langsung dari process.env untuk keamanan di Edge Runtime
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; // Sesuaikan dengan nama variabel Anda

  if (!url || !anonKey) {
    throw new Error("Missing Supabase Environment Variables");
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Sinkronisasi cookie ke request dan response
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
