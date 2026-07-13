import type { Metadata } from "next";
import seoJson from "@/data/seo.json";
import { site } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yanivgoltshian.github.io";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Full deploy origin INCLUDING the GitHub Pages base path.
// Canonicals + OG URLs must be FULL absolute URLs: a site-absolute path like
// "/products/botox/" resolved against metadataBase drops the base path, so we
// always build absolute URLs from this origin instead.
export const ORIGIN = `${SITE_URL}${BASE_PATH}`;

export const OG_IMAGE = `${ORIGIN}/og-image.jpg`;

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return ORIGIN + (path.startsWith("/") ? path : `/${path}`);
}

export type FaqItem = { q: string; a: string };

type PageSeo = { title: string; description: string; h1: string };
type CategorySeo = PageSeo & { intro: string; faq?: FaqItem[] };
type TreatmentSeo = PageSeo & { intro: string; price?: number; faq?: FaqItem[] };

export type SeoData = {
  keywords: string[];
  geo: { latitude: number; longitude: number; region: string; postalCode: string; mapUrl: string };
  areaServed: string[];
  paymentAccepted: string;
  openingHours: { days: string[]; opens: string; closes: string }[];
  pages: Record<"home" | "products" | "branded" | "about" | "contact", PageSeo>;
  categories: Record<string, CategorySeo>;
  treatments: Record<string, TreatmentSeo>;
  homeFaq: FaqItem[];
};

export const seo = seoJson as SeoData;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  /** Bypass the "%s | brand" title template (e.g. when the title already leads with the brand). */
  absoluteTitle?: boolean;
};

/**
 * Builds a complete Metadata object with a base-path-correct canonical plus a
 * fully re-emitted OpenGraph/Twitter block (Next does NOT deep-merge openGraph,
 * so every page must re-declare the OG image).
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  keywords,
  absoluteTitle,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : OG_IMAGE;
  const ogTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords && keywords.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      locale: "he_IL",
      siteName: site.name,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage],
    },
  };
}
