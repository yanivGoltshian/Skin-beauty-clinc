import Link from "next/link";
import { site, telLink, whatsappLink } from "@/lib/data";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";
import type { SiteWithLegal } from "@/lib/types";

export const metadata = pageMetadata({
  title: "הצהרת נגישות",
  description:
    "הצהרת הנגישות של סקין ביוטי קליניק יבנה – מחויבות לתקן הישראלי ת\"י 5568 ברמת AA, פירוט ההתאמות שבוצעו באתר, מגבלות ידועות ודרכי יצירת קשר עם רכז/ת הנגישות.",
  path: "/accessibility/",
});

const accessibleItems = [
  "מבנה HTML סמנטי ותקין המאפשר ניווט נוח בקוראי מסך.",
  "ניווט מלא באמצעות מקלדת, כולל קישור \"דלג לתוכן הראשי\".",
  "סימון מיקוד (focus) ברור ונראה לעין על כל הרכיבים הפעילים.",
  "טקסט חלופי (alt) לתמונות בעלות משמעות, וסימון תמונות נוי כלא-רלוונטיות.",
  "ניגודיות צבעים העומדת בדרישת התקן – יחס של 4.5:1 לפחות לטקסט הרגיל.",
  "שיוך כל שדה טופס לתווית (label) לזיהוי בקורא מסך.",
  "תמיכה בהעדפת המערכת להפחתת אנימציות (prefers-reduced-motion).",
  "עיצוב רספונסיבי ואזורי הקשה בגודל נוח (44 פיקסלים ומעלה) בנייד.",
];

const widgetFeatures = [
  "הגדלה והקטנה של גודל הטקסט",
  "מצב ניגודיות גבוהה",
  "הדגשת קישורים",
  "גופן קריא",
  "עצירת אנימציות",
  "איפוס ההגדרות",
];

export default function AccessibilityPage() {
  const legal = (site as SiteWithLegal).legal;
  const coord = legal?.accessibilityCoordinator;
  const coordName = coord?.name || site.name;
  const coordPhone = coord?.phone || site.phone;
  const coordEmail = coord?.email || site.email;
  const updated = legal?.accessibilityUpdated;

  return (
    <>
      <PageHero
        eyebrow="נגישות"
        title="הצהרת נגישות"
        subtitle="אנו רואים בהנגשת האתר ובמתן שירות שוויוני לכלל הגולשים, לרבות אנשים עם מוגבלות, ערך חשוב ומחויבות מתמשכת."
      />

      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="space-y-10 text-foreground leading-relaxed">
          <div>
            <h2 className="text-2xl font-black">המחויבות שלנו לנגישות</h2>
            <p className="mt-4 text-muted">
              אתר סקין ביוטי קליניק פועל להנגשת שירותיו ותכניו לאנשים עם מוגבלות, מתוך אמונה
              בזכותו של כל אדם לקבל שירות באופן שוויוני, מכובד ועצמאי. אנו שואפים לעמוד
              בהוראות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות) ובתקן
              הישראלי <span className="font-semibold text-foreground">ת&quot;י 5568</span> להנגשת
              תכנים באינטרנט, ברמת הנגשה <span className="font-semibold text-foreground">AA</span>,
              המבוסס על הנחיות <span dir="ltr">WCAG 2.0</span>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">מה הונגש באתר</h2>
            <p className="mt-4 text-muted">
              במסגרת הנגשת האתר בוצעו, בין היתר, ההתאמות הבאות:
            </p>
            <ul className="mt-4 space-y-2.5">
              {accessibleItems.map((item) => (
                <li key={item} className="flex gap-2.5 text-muted">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black">תפריט הנגישות</h2>
            <p className="mt-4 text-muted">
              באתר מוצב רכיב נגישות קבוע, הנפתח בלחיצה על כפתור הנגישות המופיע בפינת המסך.
              התפריט מאפשר התאמה אישית של חוויית הגלישה וכולל, בין היתר:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {widgetFeatures.map((f) => (
                <li key={f} className="flex gap-2.5 text-muted">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              חשוב לציין: רכיב נגישות אינו תחליף להנגשה בקוד. לצד התפריט בוצעה עבודת הנגשה
              מעמיקה במבנה האתר עצמו, כמפורט לעיל.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">מגבלות ידועות</h2>
            <p className="mt-4 text-muted">
              אנו משקיעים מאמצים רבים בהנגשת האתר, אך ייתכן שיימצאו חלקים או תכנים שטרם הונגשו
              במלואם. בפרט, ייתכנו מגבלות בתכנים המוטמעים מצד שלישי שאינם בשליטתנו המלאה (למשל
              סרטוני וידאו מיוטיוב, רכיבי וואטסאפ ואינסטגרם). אנו ממשיכים לפעול לשיפור הנגישות
              באופן שוטף, ומזמינים אתכם לעדכן אותנו בכל בעיה שתתגלה.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">רכז/ת הנגישות ופנייה בנושא נגישות</h2>
            <p className="mt-4 text-muted">
              אם נתקלתם בקושי או בבעיית נגישות באתר, נשמח שתפנו אלינו. אנא ציינו את הדף שבו
              הבחנתם בבעיה ואת מהות הקושי, כדי שנוכל לטפל בפנייה במהירות וביעילות. נשתדל לטפל
              בכל פנייה בהקדם האפשרי, ולכל המאוחר בתוך 14 ימי עסקים.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm font-semibold text-brand">רכז/ת הנגישות</p>
              <p className="mt-1 text-lg font-bold text-foreground">{coordName}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <dt className="font-semibold text-foreground">טלפון:</dt>
                  <dd>
                    <a
                      href={telLink(coordPhone)}
                      dir="ltr"
                      className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                    >
                      {coordPhone}
                    </a>
                  </dd>
                </div>
                {coordEmail && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <dt className="font-semibold text-foreground">דוא&quot;ל:</dt>
                    <dd>
                      <a
                        href={`mailto:${coordEmail}`}
                        dir="ltr"
                        className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                      >
                        {coordEmail}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <dt className="font-semibold text-foreground">וואטסאפ:</dt>
                  <dd>
                    <a
                      href={whatsappLink("היי, ברצוני לדווח על נושא נגישות באתר")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                    >
                      שליחת הודעה
                    </a>
                  </dd>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <dt className="font-semibold text-foreground">כתובת:</dt>
                  <dd className="text-muted">{site.address}</dd>
                </div>
              </dl>
            </div>
          </div>

          {updated && (
            <p className="border-t border-border pt-6 text-sm text-muted">
              הצהרת הנגישות עודכנה לאחרונה: {updated}.
            </p>
          )}

          <p className="text-sm text-muted">
            למידע על אופן הטיפול בנתונים שלכם ראו את{" "}
            <Link href="/privacy/" className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark">
              מדיניות הפרטיות
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
