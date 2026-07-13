import { products, categories } from "@/lib/data";
import ProductsCatalog from "@/components/ProductsCatalog";
import PageHero from "@/components/PageHero";
import { seo, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: seo.pages.products.title,
  description: seo.pages.products.description,
  path: "/products/",
});

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="טיפולים"
        title={seo.pages.products.h1}
        subtitle="סננו לפי תחום, חפשו טיפול או הציגו רק את מבצעי ההשקה."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ProductsCatalog products={products} categories={categories} />
      </div>
    </>
  );
}
