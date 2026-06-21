import type { Metadata } from "next";
import { products, categories } from "@/lib/data";
import ProductsCatalog from "@/components/ProductsCatalog";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "כל הטיפולים",
  description: "כל הטיפולים של סקין ביוטי קליניק – בוטוקס, מילוי, עיצוב אף, RF, לייזר להסרת שיער, PRP וטיפולי פנים. סננו לפי תחום ומצאו את הטיפול המתאים.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="טיפולים"
        title="כל הטיפולים שלנו"
        subtitle="סננו לפי תחום, חפשו טיפול או הציגו רק את מבצעי ההשקה."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ProductsCatalog products={products} categories={categories} />
      </div>
    </>
  );
}
