"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Download, Eye, FileStack } from "lucide-react";

import { PapersTable, type MyPaperRow } from "@/components/dashboard/PapersTable";
import { UploadPaperModal } from "@/components/dashboard/UploadPaperModal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardWorkspaceProps = {
  papers: MyPaperRow[];
  initialUploadOpen: boolean;
};

type StatConfig = {
  icon: LucideIcon;
  label: string;
  value: number;
  iconClass: string;
  valueClass: string;
};

export function DashboardWorkspace({ papers, initialUploadOpen }: DashboardWorkspaceProps) {
  const [uploadOpen, setUploadOpen] = useState(initialUploadOpen);

  useEffect(() => {
    setUploadOpen(initialUploadOpen);
  }, [initialUploadOpen]);

  const stats: StatConfig[] = [
    {
      icon: FileStack,
      label: "Total uploads",
      value: papers.length,
      iconClass: "bg-sage-muted",
      valueClass: "text-slate-900",
    },
    {
      icon: Eye,
      label: "Total views",
      value: papers.reduce((s, p) => s + (p.view_count ?? 0), 0),
      iconClass: "bg-sage-muted/80",
      valueClass: "text-foreground",
    },
    {
      icon: Download,
      label: "Total downloads",
      value: papers.reduce((s, p) => s + (p.download_count ?? 0), 0),
      iconClass: "bg-sage-muted/80",
      valueClass: "text-foreground",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value, iconClass, valueClass }) => (
          <Card key={label} className="border-forest/15 bg-card shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <span
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-lg text-forest",
                  iconClass,
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className={cn("text-2xl font-semibold tabular-nums", valueClass)}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Papers</h1>
          <p className="text-sm text-muted-foreground">Kelola publikasi yang Anda unggah.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-gold font-semibold text-cta-foreground hover:bg-gold-hover"
            onClick={() => setUploadOpen(true)}
          >
            + Upload New Paper
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Browse catalog
          </Link>
        </div>
      </div>

      <UploadPaperModal open={uploadOpen} onOpenChange={setUploadOpen} />

      <PapersTable papers={papers} />
    </div>
  );
}
