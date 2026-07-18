import type { Metadata } from "next";
import { Navbar } from "@/components";
import "./globals.css";

export const metadata: Metadata = {
  title: "赛事信息服务平台",
  description: "实时赛程、比分预测、精彩评论",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
