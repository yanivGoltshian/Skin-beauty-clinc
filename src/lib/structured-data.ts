import { site, categories, productsInCategory } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
import { ORIGIN, seo, OG_IMAGE, type FaqItem } from "@/lib/seo";

// Kept for backwards-compat: sitemap.ts + robots.ts import SITE_URL from here.
// Includes the deploy base path (GitHub Pages project site).
export const SITE_URL = ORIGIN;

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// "הקישון 5, יבנה" -> "הקישון 5" (locality lives in addressLocality).
const STREET_ADDRESS = site.address.replace(/,\s*יבנה\s*$/u, "").trim();
// site.whatsapp is E.164 digits ("972546755521") -> "+972546755521".
const TELEPHONE = site.whatsapp ? `+${site.whatsapp}` : site.phone;

function areaServed() {
  return seo.areaServed.map((name) => ({ "@type": "City", name }));
}

/** Rich LocalBusiness node: a medical-aesthetics clinic in Yavne. */
export function localBusinessLd() {
  return {
    "@type": ["MedicalClinic", "BeautySalon"],
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    alternateName: "SKIN Beauty Clinic",
    description: seo.pages.home.description,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/images/brand/logo.png`,
    image: [OG_IMAGE, `${SITE_URL}/images/banners/hero.jpg`],
    telephone: TELEPHONE,
    ...(site.email ? { email: site.email } : {}),
    priceRange: "₪₪",
    currenciesAccepted: "ILS",
    paymentAccepted: seo.paymentAccepted,
    address: {
      "@type": "PostalAddress",
      streetAddress: STREET_ADDRESS,
      addressLocality: site.city,
      addressRegion: seo.geo.region,
      addressCountry: "IL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: seo.geo.latitude,
      longitude: seo.geo.longitude,
    },
    hasMap: seo.geo.mapUrl,
    areaServed: areaServed(),
    openingHoursSpecification: seo.openingHours.map((o) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: o.days,
      opens: o.opens,
      closes: o.closes,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "טיפולי יופי ואסתטיקה רפואית ביבנה",
      itemListElement: categories.map((c) => ({
        "@type": "OfferCatalog",
        name: seo.categories[c.slug]?.h1 ?? c.name,
        url: `${SITE_URL}/category/${c.slug}/`,
        itemListElement: productsInCategory(c.id).map((p) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: p.name,
            url: `${SITE_URL}/products/${p.slug}/`,
          },
        })),
      })),
    },
    sameAs: [site.social.facebook, site.social.instagram].filter(Boolean),
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    inLanguage: "he-IL",
    publisher: { "@id": ORG_ID },
  };
}

/** Site-wide JSON-LD graph rendered once in the root layout. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [localBusinessLd(), websiteLd()],
  };
}

/** A single treatment as a Service; attaches an Offer only when a real price exists. */
export function serviceLd(product: Product) {
  const t = seo.treatments[product.slug];
  const price = t?.price;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/products/${product.slug}/#service`,
    serviceType: product.name,
    name: t?.h1 ?? product.name,
    description: t?.description ?? product.shortDesc,
    url: `${SITE_URL}/products/${product.slug}/`,
    ...(product.image ? { image: `${SITE_URL}${product.image}` } : {}),
    provider: { "@id": ORG_ID },
    areaServed: areaServed(),
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            price: String(price),
            priceCurrency: "ILS",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/products/${product.slug}/`,
            seller: { "@id": ORG_ID },
          },
        }
      : {}),
  };
}

/** A treatment category as an OfferCatalog of its treatments. */
export function categoryServiceLd(category: Category) {
  const c = seo.categories[category.slug];
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${SITE_URL}/category/${category.slug}/#catalog`,
    name: c?.h1 ?? category.name,
    description: c?.description ?? category.blurb,
    url: `${SITE_URL}/category/${category.slug}/`,
    provider: { "@id": ORG_ID },
    itemListElement: productsInCategory(category.id).map((p) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: p.name,
        url: `${SITE_URL}/products/${p.slug}/`,
      },
    })),
  };
}

export function faqLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.url}`,
    })),
  };
}
