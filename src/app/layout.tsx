import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PAPER_NAME, PAPER_TITLE } from "@/lib/paper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  /* The full paper title, not just the name: this is what shows in a browser
     tab, a search result and a shared link, and the name alone says nothing
     about what the work is. `template` keeps sub-pages from repeating it. */
  title: {
    default: PAPER_TITLE,
    template: `%s · ${PAPER_NAME}`,
  },
  description:
    "An open, modular research stack for systematic World\u2013Action Model pretraining.",
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
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
