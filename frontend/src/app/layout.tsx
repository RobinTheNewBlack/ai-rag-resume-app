import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sumi.ai",
  description: "AI Resume Screening",
};

import { Sidebar } from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${prompt.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-slate-50/50">
          <Sidebar />
          <main className="flex-1 w-full relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
