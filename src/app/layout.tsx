import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientOnly from "./(components)/ClientOnly";
import ClientNav from "./(components)/ClientNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "พระสุขภาพดี",
  description: "แพลตฟอร์มช่วยพระสงฆ์ดูแลสุขภาพ ด้วยกิจกรรมที่เหมาะสมกับวัตรปฏิบัติ",
  icons: {
    icon: [
      { url: "/monk_health.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/monk_health.ico", sizes: "16x16", type: "image/x-icon" },
    ],
    shortcut: "/monk_health.ico",
    apple: "/monk_health.ico",
  },
  openGraph: {
    title: "พระสุขภาพดี",
    description: "แพลตฟอร์มช่วยพระสงฆ์ดูแลสุขภาพ ด้วยกิจกรรมที่เหมาะสมกับวัตรปฏิบัติ",
    images: ["/monk_health.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-orange-50 to-white min-h-screen flex flex-col`}>
        <header className="w-full sticky top-0 z-10 text-white" style={{backgroundColor: "var(--brand-500)"}}>
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <a href="/dashboard" className="font-semibold tracking-tight">พระสุขภาพดี</a>
            <ClientOnly>
              <ClientNav />
            </ClientOnly>
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-6xl px-4 py-6 w-full">
          {children}
        </main>
        <footer className="mt-8 text-xs text-white" style={{backgroundColor: "var(--brand-500)"}}>
          <div className="mx-auto max-w-6xl px-4 py-6">© {new Date().getFullYear()} พระสุขภาพดี</div>
        </footer>
      </body>
    </html>
  );
}
