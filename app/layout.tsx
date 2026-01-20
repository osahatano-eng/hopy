// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ScrollRestoration from "@/app/_components/ScrollRestoration";
import ScrollManager from "@/app/_components/ScrollManager";

export const metadata: Metadata = {
  title: "AI VISUAL STUDIO | HOPY AI ホピー株式会社",
  description: "9:16(1080x1920)最適化 / youtubeショート / instagramリール / 壁紙向け、AIビジュアル販売。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
<ScrollRestoration />
        <ScrollManager />
{children}</body>
    </html>
  );
}


