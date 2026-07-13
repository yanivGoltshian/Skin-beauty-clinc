import { notFound } from "next/navigation";
import Link from "next/link";
import { categories, getCategory, productsInCategory, products } from "@/lib/data";
import ProductsCatalog from "@/components/ProductsCatalog";
import PageHero from "@/components/PageHero";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, categoryServiceLd, faqLd } from "@/lib/structured-data";
import { seo, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const s = seo.categories[slug];
  return pageMetadata({
    title: s?.title ?? category.name,
    description: s?.description ?? category.blurb,
    path: `/category/${slug}/`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const s = seo.categories[slug];
  const inCat = productsInCategory(category.id);
  const faq = s?.faq ?? [];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "בית", url: "/" },
            { name: "טיפולים", url: "/products/" },
            { name: category.name, url: `/category/${category.slug}/` },
          ]),
          categoryServiceLd(category),
          ...(faq.length ? [faqLd(faq)] : []),
        ]}
      />
      <PageHero eyebrow="תחום טיפול" title={s?.h1 ?? category.name} subtitle={category.blurb} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <nav aria-label="פירורי לחם" className="mb-6 flex flex-wrap gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-brand">בית</Link>
          <span>/</span>
          <Link href="/products/" className="hover:text-brand">טיפולים</Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {s?.intro && (
          <p className="mb-8 max-w-3xl text-muted leading-relaxed">{s.intro}</p>
        )}

        <ProductsCatalog products={products} categories={categories} initialCategory={category.id} />
        <p className="sr-only">{inCat.length} טיפולים בתחום</p>

        {faq.length > 0 && <Faq items={faq} className="mt-16" />}
      </div>
    </>
  );
}
