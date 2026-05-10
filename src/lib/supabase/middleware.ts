import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import type { Database } from "./types";
import { getSupabaseEnv } from "./env";

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, anonKey } = getSupabaseEnv();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}

