import type { FaqItem } from "@/lib/seo";

type Props = {
  items: FaqItem[];
  title?: string;
  className?: string;
};

/**
 * Accessible FAQ using native <details>/<summary>.
 * The visible question/answer text is identical to what feeds FAQPage JSON-LD,
 * so the structured data always matches on-page content.
 */
export default function Faq({ items, title = "שאלות נפוצות", className = "" }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <section className={`mx-auto w-full max-w-3xl ${className}`} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-6 text-center text-2xl font-bold text-ink sm:text-3xl">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((item, i) => (
          <details key={i} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-right text-base font-semibold text-ink marker:hidden">
              <span>{item.q}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-gold-dark transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
