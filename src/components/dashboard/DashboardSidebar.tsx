"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "My Papers", icon: FileText },
  { href: "/dashboard/settings", label: "Profile Settings", icon: Settings },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-forest/15 bg-card lg:block">
      <div className="sticky top-14 space-y-1 px-3 py-6">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Menu
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname.startsWith("/dashboard/upload")
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sage-muted font-medium text-forest"
                  : "text-foreground hover:bg-sage-muted/50",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
