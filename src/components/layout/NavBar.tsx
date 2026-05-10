import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function NavBar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
      .from("profiles")
      .select("role, verification_status")
      .eq("id", user.id)
      .maybeSingle()
    : { data: null };

  const showAdmin =
    profile?.role === "admin" && profile?.verification_status === "approved";

  return (
    <header className="sticky top-0 z-50 border-b border-forest/25 bg-forest text-primary-foreground shadow-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="\"
          className="group inline-flex items-center gap-2.5 font-semibold tracking-tight text-primary-foreground"
        >

          <img src="logo.png" alt="logo" width="25px" height="50px" className="justify-center"></img>

          <span className="leading-tight">
            <span className="block text-sm">Repository</span>
            <span className="block text-[11px] font-normal text-primary-foreground/75">
              MTsN 4 JKT
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-primary-foreground hover:bg-white/10 hover:text-primary-foreground",
            )}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:inline-flex",
            )}
          >
            Dashboard
          </Link>
          {showAdmin ? (
            <Link
              href="/admin/users"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:inline-flex",
              )}
            >
              Admin
            </Link>
          ) : null}

          {user ? (
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-white/35 bg-white/10 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              >
                Log out
              </Button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground",
                )}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-gold font-semibold text-cta-foreground shadow-sm hover:bg-gold-hover",
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header >
  );
}
