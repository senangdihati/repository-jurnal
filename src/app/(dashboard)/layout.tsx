import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full bg-muted">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 border-t border-forest/10 lg:border-l lg:border-t-0">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
