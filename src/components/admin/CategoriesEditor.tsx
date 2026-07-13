"use client";

// Categories editor — the four treatment groups shown on the homepage and
// used for /category/<slug>/ pages. Per-item patch on save.

import type { Category } from "@/lib/types";
import { Section, Field, TextInput, TextArea, Button } from "./ui";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateCategories(cats: Category[]): string | null {
  const slugs = new Set<string>();
  for (const c of cats) {
    if (!c.name.trim()) return "לכל קטגוריה חייב להיות שם.";
    if (!c.slug.trim() || !SLUG_RE.test(c.slug)) return `slug לא תקין בקטגוריה "${c.name}".`;
    if (slugs.has(c.slug)) return `slug כפול: ${c.slug}`;
    slugs.add(c.slug);
  }
  return null;
}

function newCategory(existing: Category[]): Category {
  let n = existing.length + 1;
  let id = `category-${n}`;
  while (existing.some((c) => c.id === id)) id = `category-${++n}`;
  return { id, name: "", slug: "", blurb: "", color: "#b0855f" };
}

type Props = {
  categories: Category[];
  onChange: (c: Category[]) => void;
};

export default function CategoriesEditor({ categories, onChange }: Props) {
  const update = (i: number, c: Category) => onChange(categories.map((x, j) => (j === i ? c : x)));
  const remove = (i: number) => onChange(categories.filter((_, j) => j !== i));
  const add = () => onChange([...categories, newCategory(categories)]);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{categories.length} קטגוריות</p>
        <Button type="button" onClick={add}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          קטגוריה חדשה
        </Button>
      </div>

      {categories.map((c, i) => (
        <Section
          key={c.id}
          title={c.name || "קטגוריה ללא שם"}
          hint={c.slug ? `/category/${c.slug}/` : "חסר slug"}
          badge={<span className="h-4 w-4 rounded-full ring-1 ring-border" style={{ backgroundColor: c.color }} />}
          preview={
            <div className="rounded-2xl border border-border border-t-4 bg-white p-4 text-center card-elegant" style={{ borderTopColor: c.color }}>
              <div className="font-display text-base font-bold" style={{ color: c.color }}>
                {c.name || "קטגוריה"}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{c.blurb}</p>
            </div>
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="שם">
              <TextInput value={c.name} onChange={(e) => update(i, { ...c, name: e.target.value })} />
            </Field>
            <Field label="מזהה כתובת (slug)" hint="אנגלית בלבד" >
              <TextInput dir="ltr" value={c.slug} onChange={(e) => update(i, { ...c, slug: e.target.value })} />
            </Field>
          </div>
          <Field label="תיאור קצר">
            <TextArea value={c.blurb} onChange={(e) => update(i, { ...c, blurb: e.target.value })} />
          </Field>
          <Field label="צבע">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : "#b0855f"}
                onChange={(e) => update(i, { ...c, color: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-white"
                aria-label="בחירת צבע"
              />
              <TextInput dir="ltr" value={c.color} onChange={(e) => update(i, { ...c, color: e.target.value })} className="max-w-[140px]" />
            </div>
          </Field>
          <div className="flex justify-end border-t border-border pt-3">
            <Button variant="danger" type="button" onClick={() => remove(i)}>
              מחק קטגוריה
            </Button>
          </div>
        </Section>
      ))}
    </div>
  );
}
