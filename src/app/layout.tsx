import type { Metadata, Viewport } from "next";
import { Heebo, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import StickyCtaBar from "@/components/StickyCtaBar";
import SkipLink from "@/components/SkipLink";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import CookieNotice from "@/components/CookieNotice";
import LaunchBanner from "@/components/LaunchBanner";
import JsonLd from "@/components/JsonLd";
import { siteGraph } from "@/lib/structured-data";
import { seo, OG_IMAGE, absoluteUrl } from "@/lib/seo";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  weight: ["300", "400", "500", "700", "800", "900"],
});

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-frank",
  weight: ["500", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yanivgoltshian.github.io";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}${BASE_PATH}/`),
  title: {
    default: seo.pages.home.title,
    template: `%s | ${site.name}`,
  },
  description: seo.pages.home.description,
  keywords: seo.keywords,
  openGraph: {
    title: seo.pages.home.title,
    description: seo.pages.home.description,
    type: "website",
    locale: "he_IL",
    siteName: site.name,
    url: absoluteUrl("/"),
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: seo.pages.home.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.pages.home.title,
    description: seo.pages.home.description,
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#8b6a4a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} ${frank.variable} antialiased`}>
        <SkipLink />
        <JsonLd data={siteGraph()} />
        <Header />
        <LaunchBanner />
        <main id="content" tabIndex={-1} className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFab />
        <StickyCtaBar />
        <AccessibilityWidget />
        <CookieNotice />
      </body>
    </html>
  );
}
