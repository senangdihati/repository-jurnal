import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile Settings</h1>
        <p className="text-sm text-slate-600">
          Halaman pengaturan profil. Hubungkan dengan formulir profil Supabase sesuai kebutuhan
          Anda.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Akun</CardTitle>
          <CardDescription>Kelola nama lengkap dan afiliasi di tabel profiles.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Implementasi edit profil dapat ditambahkan di sini (form + server action).
        </CardContent>
      </Card>
    </div>
  );
}
