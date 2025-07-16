import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LayoutContent from "@/components/LayoutContent";

export const metadata: Metadata = {
  title: "Drift - Discover Electronic Music Venues, Events & Artists",
  description: "Rate and discover the best electronic music venues, events, and artists. Join the community of music enthusiasts, promoters, and creators.",
  keywords: "electronic music, venues, events, artists, DJs, clubs, techno, house, reviews, ratings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-black text-white overflow-x-hidden" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <Header />
        <LayoutContent>
          {children}
        </LayoutContent>
        <Footer />
      </body>
    </html>
  );
}
