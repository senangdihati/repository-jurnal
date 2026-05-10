import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function DashboardAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-600">
          Ringkasan aktivitas unduhan dan tayangan berdasarkan kolom metadata paper.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>
            Nilai agregat dapat dihitung dari `view_count` dan `download_count` setelah instrumentasi
            ditambahkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Untuk saat ini, gunakan statistik pada halaman &quot;My Papers&quot; sebagai ringkasan dasar.
        </CardContent>
      </Card>
    </div>
  );
}
