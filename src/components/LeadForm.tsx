"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { products, site, whatsappLink } from "@/lib/data";

type LeadFormProps = {
  defaultProduct?: string;
  variant?: "full" | "compact";
};

export default function LeadForm({ defaultProduct, variant = "full" }: LeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    product: defaultProduct ?? "",
    quantity: "",
    branded: "",
    message: "",
  });
  const [showMore, setShowMore] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const uid = useId();
  const privacyId = `privacy-consent-${uid}`;
  const marketingId = `marketing-consent-${uid}`;
  const errorId = `privacy-consent-error-${uid}`;

  function buildText() {
    const lines = [
      "היי, אשמח לקבוע תור / בדיקת התאמה",
      form.name && `שם: ${form.name}`,
      form.phone && `טלפון: ${form.phone}`,
      form.product && `טיפול מבוקש: ${form.product}`,
      form.quantity && `מועד מועדף: ${form.quantity}`,
      form.branded && `מטרת הפנייה: ${form.branded}`,
      form.message && `הערות: ${form.message}`,
      "———",
      "אישור מדיניות פרטיות: כן",
      `הסכמה לדיוור פרסומי: ${marketingConsent ? "כן" : "לא"}`,
      `תאריך ושעה: ${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}`,
    ].filter(Boolean);
    return lines.join("\n");
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls =
    "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyConsent) {
      setConsentError(true);
      return;
    }
    window.open(whatsappLink(buildText()), "_blank");
  };

  const consentFields = (
    <div className="grid gap-3">
      <div className="flex items-start gap-2.5">
        <input
          id={privacyId}
          type="checkbox"
          checked={privacyConsent}
          onChange={(e) => {
            setPrivacyConsent(e.target.checked);
            if (e.target.checked) setConsentError(false);
          }}
          required
          aria-required="true"
          aria-invalid={consentError || undefined}
          aria-describedby={consentError ? errorId : undefined}
          aria-label="אישור מדיניות פרטיות (חובה)"
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
        />
        <span className="text-sm text-muted leading-snug">
          <label htmlFor={privacyId} className="cursor-pointer">
            קראתי ואני מאשר/ת את{" "}
          </label>
          <Link
            href="/privacy/"
            target="_blank"
            className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
          >
            מדיניות הפרטיות
          </Link>
          <span aria-hidden="true" className="text-eco-dark"> *</span>
        </span>
      </div>
      {consentError && (
        <p id={errorId} role="alert" className="text-sm font-semibold text-eco-dark">
          יש לאשר את מדיניות הפרטיות כדי לשלוח את הטופס.
        </p>
      )}
      <div className="flex items-start gap-2.5">
        <input
          id={marketingId}
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          aria-label="הסכמה לקבלת דיוור פרסומי (רשות)"
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
        />
        <label htmlFor={marketingId} className="text-sm text-muted leading-snug cursor-pointer">
          אני מאשר/ת קבלת דיוור פרסומי (מבצעים, עדכונים והטבות) בהודעות SMS/וואטסאפ/דוא״ל. ניתן להסיר בכל עת.
        </label>
      </div>
    </div>
  );

  // ---- COMPACT: three fields + submit in a tight inline row (near hero) ----
  if (variant === "compact") {
    return (
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="שם מלא" aria-label="שם מלא" required />
          <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="טלפון" aria-label="טלפון" type="tel" required />
          <select className={inputCls} value={form.product} onChange={set("product")} aria-label="הטיפול המבוקש">
            <option value="">הטיפול המבוקש…</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
            <option value="אחר / לא בטוח/ה">אחר / לא בטוח/ה</option>
          </select>
          <button
            type="submit"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-eco px-6 py-3 font-semibold text-white hover:bg-eco-dark transition"
          >
            קבעי בדיקת התאמה חינם
          </button>
        </div>
        {consentFields}
        <p className="text-xs text-muted">הפרטים נשלחים ישירות אלינו לוואטסאפ – ללא שמירה במאגר.</p>
      </form>
    );
  }

  // ---- FULL: 3 default fields, extras behind an optional toggle ----
  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">שם מלא</label>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="ישראל ישראלי" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">טלפון</label>
          <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="050-0000000" type="tel" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">הטיפול המבוקש</label>
        <select className={inputCls} value={form.product} onChange={set("product")}>
          <option value="">בחרו טיפול…</option>
          {products.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
          <option value="אחר / לא בטוח/ה">אחר / לא בטוח/ה</option>
        </select>
      </div>

      {/* optional extra details — collapsed by default */}
      <div>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:text-brand transition"
        >
          <span className="text-base leading-none">{showMore ? "–" : "+"}</span>
          עוד פרטים (לא חובה)
        </button>
      </div>

      {showMore && (
        <div className="grid gap-4 animate-fade-up">
          <div>
            <label className="block text-sm font-medium mb-1.5">מועד מועדף</label>
            <input className={inputCls} value={form.quantity} onChange={set("quantity")} placeholder="לדוגמה: ימי שלישי אחה״צ" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">מטרת הפנייה</label>
            <div className="flex flex-wrap gap-2">
              {["קביעת תור", "בדיקת התאמה", "שאלה כללית", "מבצעי השקה"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm((f) => ({ ...f, branded: opt }))}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                    form.branded === opt
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-white hover:border-brand/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">הערות נוספות</label>
            <textarea className={inputCls} rows={3} value={form.message} onChange={set("message")} placeholder="אזור הטיפול, שאלות, מועד מבוקש…" />
          </div>
        </div>
      )}

      {consentFields}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-eco px-6 py-3.5 font-semibold text-white hover:bg-eco-dark transition"
        >
          שליחה בוואטסאפ
        </button>
        <a
          href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold hover:border-brand hover:text-brand transition"
        >
          חיוג למרפאה
        </a>
      </div>
      <p className="text-xs text-muted">הפרטים נשלחים ישירות אלינו לוואטסאפ – ללא שמירה במאגר.</p>
    </form>
  );
}
