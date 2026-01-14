import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/ui/footer-section";
import LayoutContent from "@/components/LayoutContent";
import { AuthProvider } from "@/contexts/AuthContext";

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
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-black text-white overflow-x-hidden">
        <AuthProvider>
          <Header />
          <LayoutContent>
            {children}
          </LayoutContent>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
