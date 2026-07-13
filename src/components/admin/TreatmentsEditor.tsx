"use client";

// Treatments (products) editor — full CRUD. Each treatment is an accordion
// section with an inline card preview matching ProductCard. Saving uses
// per-item patch semantics (see AdminApp.applyItemDiff).

import type { Product, Category } from "@/lib/types";
import { asset } from "@/lib/asset";
import ImagePicker, { ASPECT } from "./ImagePicker";
import { Section, Field, TextInput, TextArea, Toggle, StringList, ChipSelect, Button, cn } from "./ui";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateProducts(products: Product[]): string | null {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const p of products) {
    if (!p.name.trim()) return "לכל טיפול חייבת להיות שם.";
    if (!p.slug.trim()) return `לטיפול "${p.name}" חסר מזהה כתובת (slug).`;
    if (!SLUG_RE.test(p.slug)) return `המזהה "${p.slug}" לא תקין — אותיות לטיניות קטנות, מספרים ומקפים בלבד.`;
    if (ids.has(p.id)) return `מזהה כפול: ${p.id}`;
    if (slugs.has(p.slug)) return `slug כפול: ${p.slug}`;
    ids.add(p.id);
    slugs.add(p.slug);
  }
  return null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function newProduct(existing: Product[]): Product {
  let n = existing.length + 1;
  let id = `treatment-${n}`;
  while (existing.some((p) => p.id === id)) id = `treatment-${++n}`;
  return {
    id,
    name: "",
    slug: "",
    categoryIds: [],
    image: "",
    shortDesc: "",
    description: "",
    features: [],
    uses: [],
    branded: false,
  };
}

type Props = {
  products: Product[];
  categories: Category[];
  onChange: (p: Product[]) => void;
};

export default function TreatmentsEditor({ products, categories, onChange }: Props) {
  const catOpts = categories.map((c) => ({ id: c.id, label: c.name }));
  const update = (i: number, p: Product) => onChange(products.map((x, j) => (j === i ? p : x)));
  const remove = (i: number) => onChange(products.filter((_, j) => j !== i));
  const add = () => onChange([...products, newProduct(products)]);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{products.length} טיפולים</p>
        <Button type="button" onClick={add}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          טיפול חדש
        </Button>
      </div>

      {products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-cream/40 p-8 text-center text-sm text-muted">
          עדיין אין טיפולים. לחצי על «טיפול חדש» כדי להתחיל.
        </div>
      )}

      {products.map((p, i) => {
        const nameErr = !p.name.trim();
        const slugErr = !p.slug.trim() || !SLUG_RE.test(p.slug);
        return (
          <Section
            key={p.id}
            title={p.name || "טיפול ללא שם"}
            hint={p.slug ? `/${p.slug}/` : "חסר מזהה כתובת"}
            badge={
              (nameErr || slugErr) ? (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">חסר מידע</span>
              ) : p.branded ? (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold-dark">מותג</span>
              ) : null
            }
            preview={<CardPreview p={p} />}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="שם הטיפול" error={nameErr ? "שדה חובה" : undefined}>
                <TextInput
                  value={p.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = !p.slug || p.slug === slugify(p.name);
                    update(i, { ...p, name, slug: autoSlug ? slugify(name) : p.slug });
                  }}
                />
              </Field>
              <Field label="מזהה כתובת (slug)" hint="אנגלית בלבד: botox, lip-filler" error={slugErr ? "אותיות לטיניות/מספרים/מקפים" : undefined}>
                <TextInput dir="ltr" value={p.slug} onChange={(e) => update(i, { ...p, slug: e.target.value })} />
              </Field>
            </div>

            <Field label="תיאור קצר" hint="שורה אחת שמופיעה בכרטיס">
              <TextInput value={p.shortDesc} onChange={(e) => update(i, { ...p, shortDesc: e.target.value })} />
            </Field>
            <Field label="תיאור מלא">
              <TextArea value={p.description} onChange={(e) => update(i, { ...p, description: e.target.value })} className="min-h-[120px]" />
            </Field>

            <Field label="קטגוריות">
              <ChipSelect value={p.categoryIds} options={catOpts} onChange={(categoryIds) => update(i, { ...p, categoryIds })} emptyText="לא שויכו קטגוריות" />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="יתרונות / מאפיינים">
                <StringList items={p.features} onChange={(features) => update(i, { ...p, features })} addLabel="הוסף מאפיין" />
              </Field>
              <Field label="מתאים ל / שימושים">
                <StringList items={p.uses} onChange={(uses) => update(i, { ...p, uses })} addLabel="הוסף שימוש" />
              </Field>
            </div>

            <ImagePicker
              mode="asset"
              label="תמונת הטיפול"
              aspect={ASPECT.product}
              value={p.image}
              folder="public/images/treatments"
              namePrefix={p.slug || p.id}
              onChange={(image) => update(i, { ...p, image })}
            />

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Toggle checked={p.branded} onChange={(branded) => update(i, { ...p, branded })} label="טיפול מותג (מבצע השקה)" />
              <Button variant="danger" type="button" onClick={() => remove(i)}>
                מחק טיפול
              </Button>
            </div>
          </Section>
        );
      })}

      {products.length > 3 && (
        <Button type="button" variant="soft" onClick={add}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          טיפול חדש
        </Button>
      )}
    </div>
  );
}

function CardPreview({ p }: { p: Product }) {
  return (
    <div className={cn("mx-auto max-w-[220px] overflow-hidden rounded-2xl border border-border bg-white", "card-elegant")}>
      <div className="relative overflow-hidden bg-cream-2" style={{ aspectRatio: "1 / 1" }}>
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(p.image)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted">אין תמונה</div>
        )}
        {p.branded && (
          <span className="absolute right-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">מותג</span>
        )}
      </div>
      <div className="p-3">
        <div className="font-display text-sm font-bold text-foreground">{p.name || "טיפול ללא שם"}</div>
        <div className="mt-1 text-[11px] leading-snug text-muted line-clamp-2">{p.shortDesc || p.description}</div>
      </div>
    </div>
  );
}
