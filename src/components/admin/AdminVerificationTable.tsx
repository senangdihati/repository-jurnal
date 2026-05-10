"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { approveUserAction, rejectUserAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type VerificationRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  university: string | null;
  verification_status: string;
  created_at: string;
  role: string;
};

type Props = { rows: VerificationRow[] };

export function AdminVerificationTable({ rows }: Props) {
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<{ ok: boolean; error?: string }>, id: string) {
    startTransition(async () => {
      const res = await action(id);
      if (res.ok) toast.success("Profil diperbarui.");
      else toast.error(res.error ?? "Gagal memperbarui.");
    });
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-sage/45 bg-card/80 px-6 py-12 text-center text-sm text-muted-foreground">
        Tidak ada pendaftaran yang menunggu tinjauan.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-forest/15 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-sage-muted/50 hover:bg-sage-muted/50">
            <TableHead>Email</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead className="hidden sm:table-cell">Afiliasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="max-w-[200px] truncate text-sm font-medium">
                {r.email ?? "—"}
              </TableCell>
              <TableCell className="text-sm">{r.full_name ?? "—"}</TableCell>
              <TableCell className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:table-cell">
                {r.university ?? "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={r.verification_status === "pending" ? "secondary" : "destructive"}
                  className="font-normal"
                >
                  {r.verification_status === "pending" ? "Menunggu" : "Ditolak"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-forest font-medium text-primary-foreground hover:bg-forest-hover"
                    disabled={isPending}
                    onClick={() => run(approveUserAction, r.id)}
                  >
                    Setujui
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={isPending}
                    onClick={() => run(rejectUserAction, r.id)}
                  >
                    Tolak
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
