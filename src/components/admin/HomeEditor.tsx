"use client";

// Homepage editor — one collapsible Section per website region, in the exact
// order they render on the live homepage, each with an inline live preview
// that echoes the site markup.

import type { Homepage, Product } from "@/lib/types";
import { asset } from "@/lib/asset";
import ImagePicker, { ASPECT } from "./ImagePicker";
import {
  Section,
  Field,
  TextInput,
  TextArea,
  Repeater,
  StringList,
  ChipSelect,
  cn,
} from "./ui";

const UPLOADS = "public/images/uploads";

type Props = {
  value: Homepage;
  onChange: (h: Homepage) => void;
  products: Product[];
};

export default function HomeEditor({ value, onChange, products }: Props) {
  const up = (patch: Partial<Homepage>) => onChange({ ...value, ...patch });
  const productOpts = products.map((p) => ({ id: p.id, label: p.name }));
  const nameOf = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="grid gap-3">
      {/* 1 — HERO */}
      <Section
        title="ראשי (Hero)"
        hint="הכותרת הגדולה, תת־כותרת, כפתורים, תמונת רקע וסרטון"
        defaultOpen
        preview={<HeroPreview h={value} />}
      >
        <Field label="תגית עליונה">
          <TextInput value={value.hero.eyebrow} onChange={(e) => up({ hero: { ...value.hero, eyebrow: e.target.value } })} />
        </Field>
        <Field label="כותרת ראשית">
          <TextArea value={value.hero.title} onChange={(e) => up({ hero: { ...value.hero, title: e.target.value } })} />
        </Field>
        <Field label="תת־כותרת">
          <TextArea value={value.hero.subtitle} onChange={(e) => up({ hero: { ...value.hero, subtitle: e.target.value } })} />
        </Field>
        <CtaFields
          label="כפתור ראשי"
          cta={value.hero.ctaPrimary}
          onChange={(c) => up({ hero: { ...value.hero, ctaPrimary: c } })}
        />
        <CtaFields
          label="כפתור משני"
          cta={value.hero.ctaSecondary}
          onChange={(c) => up({ hero: { ...value.hero, ctaSecondary: c } })}
        />
        <ImagePicker
          mode="asset"
          label="תמונת רקע"
          aspect={ASPECT.hero}
          value={value.hero.image}
          folder={UPLOADS}
          namePrefix="hero"
          onChange={(p) => up({ hero: { ...value.hero, image: p } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <ImagePicker
            mode="fixed"
            kind="video"
            label="סרטון (וידאו אנכי)"
            aspect={9 / 16}
            value="/videos/clinic-hero.mp4"
            repoPath="public/videos/clinic-hero.mp4"
          />
          <ImagePicker
            mode="fixed"
            label="תמונת פתיח לסרטון"
            aspect={9 / 16}
            value="/videos/clinic-hero-poster.jpg"
            repoPath="public/videos/clinic-hero-poster.jpg"
          />
        </div>
      </Section>

      {/* 2 — ANNOUNCEMENT */}
      <Section
        title="פס הודעה"
        hint="הרצועה הצבעונית מתחת ל־Hero"
        preview={
          <div className="rounded-lg bg-gradient-to-l from-brand via-brand-dark to-brand px-3 py-2 text-center text-xs font-medium text-white">
            {value.announcement}
          </div>
        }
      >
        <Field label="טקסט ההודעה">
          <TextArea value={value.announcement} onChange={(e) => up({ announcement: e.target.value })} />
        </Field>
      </Section>

      {/* 3 — ADVANTAGES */}
      <Section
        title="יתרונות"
        hint="ארבעה כרטיסים קצרים"
        preview={
          <div className="grid grid-cols-2 gap-2">
            {value.advantages.map((a, i) => (
              <div key={i} className="rounded-lg border border-border border-t-2 border-t-gold bg-white p-2">
                <div className="text-xs font-bold text-foreground">{a.title}</div>
                <div className="mt-1 text-[10px] leading-snug text-muted line-clamp-3">{a.text}</div>
              </div>
            ))}
          </div>
        }
      >
        <Repeater
          items={value.advantages}
          onChange={(advantages) => up({ advantages })}
          makeNew={() => ({ title: "", text: "" })}
          addLabel="הוסף יתרון"
          itemLabel={(i) => `יתרון ${i + 1}`}
          render={(a, update) => (
            <div className="grid gap-2">
              <TextInput placeholder="כותרת" value={a.title} onChange={(e) => update({ ...a, title: e.target.value })} />
              <TextArea placeholder="תיאור" value={a.text} onChange={(e) => update({ ...a, text: e.target.value })} />
            </div>
          )}
        />
      </Section>

      {/* 4 — INTRO */}
      <Section
        title="ברוכים הבאים"
        hint="כותרת, פסקאות וגלריית תמונות מתחלפת"
        preview={
          <div>
            <div className="text-xs font-bold text-foreground">{value.intro.title}</div>
            <div className="mt-1 text-[11px] font-medium text-foreground/80">{value.intro.lead}</div>
            {value.intro.gallery[0] && (
              <div className="mt-2 overflow-hidden rounded-lg" style={{ aspectRatio: "16 / 9" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(value.intro.gallery[0])} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        }
      >
        <Field label="כותרת">
          <TextInput value={value.intro.title} onChange={(e) => up({ intro: { ...value.intro, title: e.target.value } })} />
        </Field>
        <Field label="משפט פתיחה">
          <TextArea value={value.intro.lead} onChange={(e) => up({ intro: { ...value.intro, lead: e.target.value } })} />
        </Field>
        <Field label="פסקאות">
          <StringList
            items={value.intro.paragraphs}
            onChange={(paragraphs) => up({ intro: { ...value.intro, paragraphs } })}
            addLabel="הוסף פסקה"
            multiline
          />
        </Field>
        <Field label="גלריית תמונות (מתחלפת)" hint="יחס תצוגה רחב (16:9)">
          <Repeater
            items={value.intro.gallery}
            onChange={(gallery) => up({ intro: { ...value.intro, gallery } })}
            makeNew={() => ""}
            addLabel="הוסף תמונה לגלריה"
            itemLabel={(i) => `תמונה ${i + 1}`}
            render={(src, update, i) => (
              <ImagePicker
                mode="asset"
                aspect={ASPECT.introGallery}
                value={src}
                folder={UPLOADS}
                namePrefix={`intro-${i + 1}`}
                onChange={(p) => update(p)}
              />
            )}
          />
        </Field>
      </Section>

      {/* 5 — HOT DEALS */}
      <Section
        title="מבצעים חמים"
        hint="הקוביה המסתובבת עם התמונות"
        preview={<DarkPitchPreview eyebrow={value.hotDeals.eyebrow} title={value.hotDeals.title} text={value.hotDeals.text} cta={value.hotDeals.cta.label} />}
      >
        <Field label="תגית עליונה">
          <TextInput value={value.hotDeals.eyebrow} onChange={(e) => up({ hotDeals: { ...value.hotDeals, eyebrow: e.target.value } })} />
        </Field>
        <Field label="כותרת">
          <TextArea value={value.hotDeals.title} onChange={(e) => up({ hotDeals: { ...value.hotDeals, title: e.target.value } })} />
        </Field>
        <Field label="טקסט">
          <TextArea value={value.hotDeals.text} onChange={(e) => up({ hotDeals: { ...value.hotDeals, text: e.target.value } })} />
        </Field>
        <CtaFields label="כפתור" cta={value.hotDeals.cta} onChange={(cta) => up({ hotDeals: { ...value.hotDeals, cta } })} />
        <Field label="תמונות בקוביה" hint="מומלץ 6 תמונות מרובעות">
          <Repeater
            items={value.hotDeals.images}
            onChange={(images) => up({ hotDeals: { ...value.hotDeals, images } })}
            makeNew={() => ""}
            addLabel="הוסף תמונה"
            itemLabel={(i) => `פאה ${i + 1}`}
            render={(src, update, i) => (
              <ImagePicker
                mode="asset"
                aspect={ASPECT.hotDeals}
                value={src}
                folder={UPLOADS}
                namePrefix={`deal-${i + 1}`}
                onChange={(p) => update(p)}
              />
            )}
          />
        </Field>
      </Section>

      {/* 6 — BAG TYPES (treatment picks) */}
      <Section
        title="הטיפולים המבוקשים"
        hint="בוחרים אילו טיפולים מוצגים כאן"
        preview={
          <div>
            <div className="text-center text-xs font-bold">{value.bagTypesTitle}</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {value.bagTypes.map((id) => (
                <div key={id} className="rounded-md border border-border bg-white px-2 py-1.5 text-[10px] font-medium text-foreground">
                  {nameOf(id)}
                </div>
              ))}
            </div>
          </div>
        }
      >
        <Field label="כותרת">
          <TextInput value={value.bagTypesTitle} onChange={(e) => up({ bagTypesTitle: e.target.value })} />
        </Field>
        <Field label="תת־כותרת">
          <TextArea value={value.bagTypesSubtitle} onChange={(e) => up({ bagTypesSubtitle: e.target.value })} />
        </Field>
        <Field label="טיפולים מוצגים" hint="הסדר קובע את סדר ההצגה">
          <ChipSelect value={value.bagTypes} options={productOpts} onChange={(bagTypes) => up({ bagTypes })} />
        </Field>
      </Section>

      {/* 7 — STATS */}
      <Section
        title="מספרים"
        hint="רצועת הנתונים הכהה"
        preview={
          <div className="grid grid-cols-4 gap-2 rounded-lg bg-ink px-2 py-3 text-center text-white">
            {value.stats.map((s, i) => (
              <div key={i}>
                <div className="text-sm font-black text-gold">{s.value}</div>
                <div className="text-[9px] text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        }
      >
        <Repeater
          items={value.stats}
          onChange={(stats) => up({ stats })}
          makeNew={() => ({ value: "", label: "" })}
          addLabel="הוסף נתון"
          itemLabel={(i) => `נתון ${i + 1}`}
          render={(s, update) => (
            <div className="grid grid-cols-2 gap-2">
              <TextInput placeholder="ערך (11)" value={s.value} onChange={(e) => update({ ...s, value: e.target.value })} />
              <TextInput placeholder="תווית" value={s.label} onChange={(e) => update({ ...s, label: e.target.value })} />
            </div>
          )}
        />
      </Section>

      {/* 8 — DIAGNOSIS (nylonAdvantages) */}
      <Section
        title="האבחון שלנו"
        hint="כותרת, פסקאות, תמונה וכיתוב"
        preview={
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs font-bold text-foreground">{value.nylonAdvantages.title}</div>
              <div className="mt-1 text-[10px] leading-snug text-muted line-clamp-4">{value.nylonAdvantages.paragraphs[0]}</div>
            </div>
            <div className="overflow-hidden rounded-lg" style={{ aspectRatio: "4 / 3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/images/promos/natural-diagnosis.jpg")} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        }
      >
        <Field label="כותרת">
          <TextInput value={value.nylonAdvantages.title} onChange={(e) => up({ nylonAdvantages: { ...value.nylonAdvantages, title: e.target.value } })} />
        </Field>
        <Field label="פסקאות">
          <StringList
            items={value.nylonAdvantages.paragraphs}
            onChange={(paragraphs) => up({ nylonAdvantages: { ...value.nylonAdvantages, paragraphs } })}
            addLabel="הוסף פסקה"
            multiline
          />
        </Field>
        <Field label="כיתוב מתחת לתמונה">
          <TextInput value={value.video.caption} onChange={(e) => up({ video: { ...value.video, caption: e.target.value } })} />
        </Field>
        <ImagePicker
          mode="fixed"
          label="תמונת האבחון"
          aspect={ASPECT.diagnosis}
          value="/images/promos/natural-diagnosis.jpg"
          repoPath="public/images/promos/natural-diagnosis.jpg"
        />
      </Section>

      {/* 9 — FEATURED */}
      <Section
        title="טיפולים מומלצים"
        hint="בוחרים אילו טיפולים מוצגים בכרטיסיות"
        preview={
          <div className="grid grid-cols-3 gap-1.5">
            {value.featuredCategories.map((id) => (
              <div key={id} className="rounded-md border border-border bg-white px-1.5 py-1 text-center text-[9px] font-medium text-foreground">
                {nameOf(id)}
              </div>
            ))}
          </div>
        }
      >
        <Field label="טיפולים מומלצים" hint="הסדר קובע את סדר ההצגה">
          <ChipSelect value={value.featuredCategories} options={productOpts} onChange={(featuredCategories) => up({ featuredCategories })} />
        </Field>
      </Section>

      {/* 10 — BRANDED PITCH */}
      <Section
        title="מבצעי השקה"
        hint="כותרת, טקסט, רשימת נקודות ותמונה"
        preview={
          <div className="grid grid-cols-2 gap-2">
            <div className="overflow-hidden rounded-lg" style={{ aspectRatio: "4 / 3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {value.brandedPitch.image && <img src={asset(value.brandedPitch.image)} alt="" className="h-full w-full object-cover" />}
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">{value.brandedPitch.title}</div>
              <ul className="mt-1 space-y-0.5">
                {value.brandedPitch.bullets.slice(0, 4).map((b, i) => (
                  <li key={i} className="text-[10px] leading-snug text-muted">• {b}</li>
                ))}
              </ul>
            </div>
          </div>
        }
      >
        <Field label="כותרת">
          <TextInput value={value.brandedPitch.title} onChange={(e) => up({ brandedPitch: { ...value.brandedPitch, title: e.target.value } })} />
        </Field>
        <Field label="טקסט">
          <TextArea value={value.brandedPitch.text} onChange={(e) => up({ brandedPitch: { ...value.brandedPitch, text: e.target.value } })} />
        </Field>
        <Field label="נקודות (רשימה)">
          <StringList
            items={value.brandedPitch.bullets}
            onChange={(bullets) => up({ brandedPitch: { ...value.brandedPitch, bullets } })}
            addLabel="הוסף נקודה"
          />
        </Field>
        <ImagePicker
          mode="asset"
          label="תמונה"
          aspect={ASPECT.branded}
          value={value.brandedPitch.image}
          folder={UPLOADS}
          namePrefix="branded"
          onChange={(p) => up({ brandedPitch: { ...value.brandedPitch, image: p } })}
        />
      </Section>

      {/* 11 — GALLERY MOSAIC (fixed files) */}
      <Section
        title="גלריית תוצאות"
        hint="שש תמונות במסגרת קבועה (מרובע)"
        preview={
          <div className="grid grid-cols-3 gap-1.5">
            {MOSAIC.map((m, i) => (
              <div key={m.path} className={cn("overflow-hidden rounded-md", i === 0 && "col-span-2 row-span-2")} style={{ aspectRatio: "1 / 1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(m.value)} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        }
      >
        <p className="text-xs text-muted">
          התמונות כאן מוחלפות במקום קבוע — כל תמונה חדשה תופיע בדיוק באותו מקום בגלריה.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {MOSAIC.map((m, i) => (
            <ImagePicker
              key={m.path}
              mode="fixed"
              label={i === 0 ? "תמונה ראשית (גדולה)" : `תמונה ${i + 1}`}
              aspect={ASPECT.mosaic}
              value={m.value}
              repoPath={m.path}
            />
          ))}
        </div>
      </Section>

      {/* 12 — ABOUT TEASER */}
      <Section
        title="קצת עלינו"
        hint="הפסקה לפני צור קשר"
        preview={
          <div className="text-center">
            <div className="text-xs font-bold text-gold-dark">{value.aboutTeaser.title}</div>
            <div className="mt-1 text-[11px] leading-snug text-foreground/80">{value.aboutTeaser.text}</div>
          </div>
        }
      >
        <Field label="תגית">
          <TextInput value={value.aboutTeaser.title} onChange={(e) => up({ aboutTeaser: { ...value.aboutTeaser, title: e.target.value } })} />
        </Field>
        <Field label="טקסט">
          <TextArea value={value.aboutTeaser.text} onChange={(e) => up({ aboutTeaser: { ...value.aboutTeaser, text: e.target.value } })} />
        </Field>
        <Field label="קישור כפתור" hint="למשל /about/">
          <TextInput value={value.aboutTeaser.href} onChange={(e) => up({ aboutTeaser: { ...value.aboutTeaser, href: e.target.value } })} />
        </Field>
      </Section>
    </div>
  );
}

const MOSAIC = [
  { path: "public/images/gallery/work-jawline.jpg", value: "/images/gallery/work-jawline.jpg" },
  { path: "public/images/gallery/work-lips-1.jpg", value: "/images/gallery/work-lips-1.jpg" },
  { path: "public/images/gallery/work-lips-2.jpg", value: "/images/gallery/work-lips-2.jpg" },
  { path: "public/images/gallery/work-lips-3.jpg", value: "/images/gallery/work-lips-3.jpg" },
  { path: "public/images/gallery/work-lips-4.jpg", value: "/images/gallery/work-lips-4.jpg" },
  { path: "public/images/gallery/work-lips-5.jpg", value: "/images/gallery/work-lips-5.jpg" },
];

function CtaFields({
  label,
  cta,
  onChange,
}: {
  label: string;
  cta: { label: string; href: string };
  onChange: (c: { label: string; href: string }) => void;
}) {
  return (
    <Field label={label}>
      <div className="grid grid-cols-2 gap-2">
        <TextInput placeholder="טקסט" value={cta.label} onChange={(e) => onChange({ ...cta, label: e.target.value })} />
        <TextInput placeholder="קישור (/contact/)" value={cta.href} onChange={(e) => onChange({ ...cta, href: e.target.value })} dir="ltr" />
      </div>
    </Field>
  );
}

function HeroPreview({ h }: { h: Homepage }) {
  return (
    <div className="relative overflow-hidden rounded-xl hero-glow p-4 text-white">
      <span className="inline-block rounded-full border border-gold/40 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-gold">
        {h.hero.eyebrow}
      </span>
      <div className="mt-2 font-display text-lg font-black leading-tight">{h.hero.title}</div>
      <div className="mt-2 h-0.5 w-16 gold-rule rounded-full" />
      <p className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-3">{h.hero.subtitle}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-eco px-3 py-1.5 text-[11px] font-semibold">{h.hero.ctaPrimary.label}</span>
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/30">{h.hero.ctaSecondary.label}</span>
      </div>
    </div>
  );
}

function DarkPitchPreview({ eyebrow, title, text, cta }: { eyebrow: string; title: string; text: string; cta: string }) {
  return (
    <div className="overflow-hidden rounded-xl hero-glow p-4 text-white">
      <span className="inline-block rounded-full border border-gold/40 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-gold">{eyebrow}</span>
      <div className="mt-2 font-display text-base font-black leading-tight">{title}</div>
      <p className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-3">{text}</p>
      <span className="mt-3 inline-block rounded-full bg-eco px-3 py-1.5 text-[11px] font-semibold">{cta}</span>
    </div>
  );
}
