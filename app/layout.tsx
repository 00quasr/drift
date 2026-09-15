import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/ui/footer-section";
import LayoutContent from "@/components/LayoutContent";
import { AuthProvider } from "@/contexts/AuthContext";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

const title = "Drift - Discover Electronic Music Venues, Events & Artists";
const description =
  "Rate and discover the best electronic music venues, events, and artists. Join the community of music enthusiasts, promoters, and creators.";

export const metadata: Metadata = {
  // Required for Open Graph image URLs to resolve against the right origin.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: title,
    template: "%s | Drift",
  },
  description,
  keywords: "electronic music, venues, events, artists, DJs, clubs, techno, house, reviews, ratings",
  openGraph: {
    title,
    description,
    siteName: SITE_NAME,
    type: "website",
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
