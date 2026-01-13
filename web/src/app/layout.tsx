import type { Metadata } from "next";
import AuthBar from "@/components/AuthBar";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "轻盈计划 | 减脂定制网页",
  description: "用更轻盈的方式打造可持续的减脂习惯与个性化计划。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${fraunces.variable} antialiased`}>
        <div className="pointer-events-none fixed right-4 top-4 z-50">
          <AuthBar />
        </div>
        {children}
      </body>
    </html>
  );
}
