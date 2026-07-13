import type { MetadataRoute } from "next";
import { site } from "@/lib/data";
import { seo } from "@/lib/seo";

// Metadata-route manifest fields (start_url, scope, icons.src) are NOT
// auto-prefixed with basePath, so we prepend it manually.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} – ${site.tagline}`,
    short_name: site.name,
    description: seo.pages.home.description,
    lang: "he",
    dir: "rtl",
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#b0855f",
    icons: [
      {
        src: `${BASE_PATH}/images/brand/logo.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
