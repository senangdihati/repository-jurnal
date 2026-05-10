import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepoMtsn4jkt",
  description: "Repositori ilmiah Mtsn4jkt — telusuri publikasi dan akses PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col bg-app bg-grid">
        <NavBar />
        <main className="relative z-0 flex flex-1 flex-col">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
