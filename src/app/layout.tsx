import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Gold POS",
  description: "Point-of-sale for a gold & jewelry shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-100 text-zinc-900">
        <header className="border-b border-amber-200 bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="text-xl font-bold tracking-tight text-amber-950">
                Gold POS
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link
                href="/"
                className="rounded-full px-4 py-2 text-amber-950 transition-colors hover:bg-amber-300/60"
              >
                Register
              </Link>
              <Link
                href="/sales"
                className="rounded-full px-4 py-2 text-amber-950 transition-colors hover:bg-amber-300/60"
              >
                Sales
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
