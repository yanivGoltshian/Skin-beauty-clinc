"use client";

// Site settings editor — brand identity, contact details, social links and
// trust badges (site.json). Merge-on-save in AdminApp.

import type { Site } from "@/lib/types";
import { Section, Field, TextInput, TextArea, StringList, cn } from "./ui";

const WA_RE = /^\d{9,15}$/;
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;

export function validateSite(s: Site): string | null {
  if (!s.name.trim()) return "שם העסק הוא שדה חובה.";
  if (s.whatsapp && !WA_RE.test(s.whatsapp)) return "מספר וואטסאפ חייב להיות ספרות בלבד עם קידומת מדינה (למשל 972546755521).";
  if (s.phone && !PHONE_RE.test(s.phone)) return "מספר טלפון לא תקין.";
  if (s.phone2 && !PHONE_RE.test(s.phone2)) return "מספר טלפון משני לא תקין.";
  if (s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) return "כתובת אימייל לא תקינה.";
  return null;
}

type Props = {
  value: Site;
  onChange: (s: Site) => void;
};

export default function SiteEditor({ value, onChange }: Props) {
  const set = <K extends keyof Site>(k: K, v: Site[K]) => onChange({ ...value, [k]: v });
  const waOk = !value.whatsapp || WA_RE.test(value.whatsapp);
  const phoneOk = !value.phone || PHONE_RE.test(value.phone);
  const emailOk = !value.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email);

  return (
    <div className="grid gap-3">
      {/* Brand identity */}
      <Section
        title="זהות המותג"
        hint="שם, סלוגן ותיאור העסק"
        defaultOpen
        preview={
          <div className="rounded-2xl border border-border bg-cream/50 p-4 text-center">
            <div className="font-display text-lg font-bold text-brand-dark">{value.name}</div>
            <div className="text-xs tracking-wide text-muted">{value.legalName}</div>
            <div className="mt-2 text-sm text-foreground">{value.tagline}</div>
          </div>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="שם העסק (עברית)">
            <TextInput value={value.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="שם רשמי / לועזי">
            <TextInput dir="ltr" value={value.legalName} onChange={(e) => set("legalName", e.target.value)} />
          </Field>
        </div>
        <Field label="סלוגן">
          <TextInput value={value.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
        <Field label="תיאור העסק" hint="משפט–שניים שמתארים את הקליניקה">
          <TextArea value={value.description} onChange={(e) => set("description", e.target.value)} className="min-h-[110px]" />
        </Field>
      </Section>

      {/* Contact */}
      <Section
        title="פרטי יצירת קשר"
        hint="טלפון, וואטסאפ, כתובת ושעות"
        defaultOpen
        preview={
          <div className="grid gap-1.5 rounded-2xl border border-border bg-white p-4 text-sm">
            <Row icon="phone" text={value.phone || "—"} />
            {value.phone2 && <Row icon="phone" text={value.phone2} />}
            <Row icon="wa" text={value.whatsapp || "—"} />
            {value.email && <Row icon="mail" text={value.email} />}
            <Row icon="pin" text={value.address || "—"} />
            <Row icon="clock" text={value.hours || "—"} />
          </div>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="טלפון ראשי" error={phoneOk ? undefined : "פורמט לא תקין"}>
            <TextInput dir="ltr" value={value.phone} onChange={(e) => set("phone", e.target.value)} placeholder="054-675-5521" />
          </Field>
          <Field label="טלפון משני (אופציונלי)">
            <TextInput dir="ltr" value={value.phone2} onChange={(e) => set("phone2", e.target.value)} />
          </Field>
          <Field label="וואטסאפ" hint="ספרות בלבד עם קידומת: 972546755521" error={waOk ? undefined : "ספרות בלבד עם קידומת מדינה"}>
            <TextInput dir="ltr" value={value.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/[^\d]/g, ""))} placeholder="972546755521" />
          </Field>
          <Field label="אימייל (אופציונלי)" error={emailOk ? undefined : "כתובת לא תקינה"}>
            <TextInput dir="ltr" value={value.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="כתובת">
            <TextInput value={value.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="עיר">
            <TextInput value={value.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
        </div>
        <Field label="שעות פעילות">
          <TextInput value={value.hours} onChange={(e) => set("hours", e.target.value)} />
        </Field>
      </Section>

      {/* Social */}
      <Section title="רשתות חברתיות" hint="קישורי פייסבוק ואינסטגרם">
        <Field label="פייסבוק">
          <TextInput dir="ltr" value={value.social.facebook} onChange={(e) => onChange({ ...value, social: { ...value.social, facebook: e.target.value } })} placeholder="https://facebook.com/..." />
        </Field>
        <Field label="אינסטגרם">
          <TextInput dir="ltr" value={value.social.instagram} onChange={(e) => onChange({ ...value, social: { ...value.social, instagram: e.target.value } })} placeholder="https://instagram.com/..." />
        </Field>
      </Section>

      {/* Trust badges */}
      <Section
        title="תגי אמון"
        hint="נקודות היתרון שמופיעות באתר"
        preview={
          <div className="flex flex-wrap gap-1.5">
            {value.certifications.map((c, i) => (
              <span key={i} className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand-dark">
                {c}
              </span>
            ))}
          </div>
        }
      >
        <Field label="רשימת תגים">
          <StringList items={value.certifications} onChange={(certifications) => set("certifications", certifications)} addLabel="הוסף תג" />
        </Field>
      </Section>
    </div>
  );
}

function Row({ icon, text }: { icon: "phone" | "wa" | "mail" | "pin" | "clock"; text: string }) {
  const paths: Record<string, React.ReactNode> = {
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
    wa: <path d="M12 2a10 10 0 0 0-8.6 15l-1 3.6 3.7-1A10 10 0 1 0 12 2z" />,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  };
  return (
    <div className={cn("flex items-center gap-2 text-foreground")} dir="ltr">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-brand">
        {paths[icon]}
      </svg>
      <span className="truncate">{text}</span>
    </div>
  );
}
