import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goodfin — Private Markets Intelligence",
  description:
    "Concept demo: AI-native private markets intelligence with premium, instant insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-[#0B0E12] text-white antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0B0E12]" />
          <div className="absolute -top-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_62%)] blur-2xl" />
          <div className="absolute -bottom-48 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_62%)] blur-2xl" />
          <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08),transparent_65%)] blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.05),transparent_40%)]" />
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
