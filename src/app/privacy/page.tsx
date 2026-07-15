import Link from "next/link";
import { site, telLink, whatsappLink } from "@/lib/data";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";
import type { SiteWithLegal } from "@/lib/types";

export const metadata = pageMetadata({
  title: "מדיניות פרטיות",
  description:
    "מדיניות הפרטיות של סקין ביוטי קליניק יבנה – איזה מידע נאסף, למה הוא משמש, מסירתו לצדדים שלישיים, זכויותיכם לפי חוק הגנת הפרטיות (תיקון 13) ודרכי יצירת קשר בנושא פרטיות.",
  path: "/privacy/",
});

const dataRights = [
  {
    title: "זכות עיון",
    text: "לקבל מידע האם מתנהל לגביכם מידע ולעיין בו.",
  },
  {
    title: "זכות תיקון",
    text: "לבקש לתקן מידע שאינו נכון, שלם, ברור או מעודכן.",
  },
  {
    title: "זכות מחיקה",
    text: "לבקש למחוק מידע, בכפוף לחובות שמירה על-פי דין.",
  },
  {
    title: "הסרה מדיוור",
    text: "לבקש בכל עת להפסיק לקבל דיוור פרסומי, ללא עלות.",
  },
];

export default function PrivacyPage() {
  const legal = (site as SiteWithLegal).legal;
  const privacyEmail = legal?.privacyEmail || site.email;
  const updated = legal?.privacyUpdated;

  return (
    <>
      <PageHero
        eyebrow="פרטיות"
        title="מדיניות פרטיות"
        subtitle="אנו מכבדים את פרטיותכם ומחויבים להגן על המידע האישי שאתם מוסרים לנו. מדיניות זו מסבירה איזה מידע נאסף, כיצד הוא משמש ומהן זכויותיכם."
      />

      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="space-y-10 text-foreground leading-relaxed">
          <div>
            <h2 className="text-2xl font-black">כללי</h2>
            <p className="mt-4 text-muted">
              מדיניות פרטיות זו חלה על השימוש באתר סקין ביוטי קליניק ועל המידע הנאסף במסגרתו.
              המדיניות מנוסחת בלשון זכר מטעמי נוחות בלבד ומתייחסת לכל המגדרים. השימוש באתר
              ובטופס יצירת הקשר מהווה הסכמה לתנאי מדיניות זו.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">מיהו בעל השליטה במידע</h2>
            <p className="mt-4 text-muted">
              בעל השליטה במאגר המידע ואחראי על המידע האישי הוא:
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-6 text-sm">
              <p className="text-lg font-bold text-foreground">{site.name}</p>
              <dl className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <dt className="font-semibold text-foreground">כתובת:</dt>
                  <dd className="text-muted">{site.address}</dd>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <dt className="font-semibold text-foreground">טלפון:</dt>
                  <dd>
                    <a
                      href={telLink(site.phone)}
                      dir="ltr"
                      className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                    >
                      {site.phone}
                    </a>
                  </dd>
                </div>
                {privacyEmail && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <dt className="font-semibold text-foreground">דוא&quot;ל:</dt>
                    <dd>
                      <a
                        href={`mailto:${privacyEmail}`}
                        dir="ltr"
                        className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                      >
                        {privacyEmail}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black">איזה מידע נאסף</h2>
            <ul className="mt-4 space-y-2.5">
              <li className="flex gap-2.5 text-muted">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>
                  <span className="font-semibold text-foreground">מידע שאתם מוסרים בטופס יצירת הקשר:</span>{" "}
                  שם מלא, מספר טלפון והטיפול המבוקש. פרטים אלה נשלחים אלינו באמצעות אפליקציית
                  וואטסאפ.
                </span>
              </li>
              <li className="flex gap-2.5 text-muted">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>
                  <span className="font-semibold text-foreground">נתוני שימוש וכלי מדידה:</span>{" "}
                  ככל שיותקנו בעתיד כלים כגון פיקסל של פייסבוק (Meta) או Google Analytics/Ads,
                  ייאסף מידע סטטיסטי ואנונימי על אופן השימוש באתר (עמודים שנצפו, מכשיר, מקור הגעה
                  וכדומה). נכון למועד זה, כלים אלה אינם פעילים באתר.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black">מטרות השימוש במידע</h2>
            <ul className="mt-4 space-y-2.5">
              {[
                "יצירת קשר לצורך קביעת תור, בדיקת התאמה ומתן מענה לפניות.",
                "מתן מידע על טיפולים ושירותים המבוקשים על-ידכם.",
                "משלוח דיוור פרסומי (מבצעים, עדכונים והטבות) – בכפוף להסכמתכם המפורשת בלבד.",
                "שיפור האתר, השירות והתאמת התכנים – על בסיס נתונים סטטיסטיים.",
              ].map((p) => (
                <li key={p} className="flex gap-2.5 text-muted">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black">מסירת מידע לצדדים שלישיים</h2>
            <p className="mt-4 text-muted">
              איננו מוכרים או משכירים את המידע האישי שלכם. מידע עשוי להימסר לצדדים שלישיים
              בהיקף הנדרש לתפעול השירות בלבד, ובכללם:
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Meta Platforms (וואטסאפ) – טופס יצירת הקשר נשלח כהודעת וואטסאפ, בכפוף למדיניות הפרטיות של Meta.",
                "פייסבוק (Meta Pixel) ו-Google (Analytics/Ads) – ככל שיופעלו בעתיד לצורכי מדידה ופרסום.",
                "GitHub Pages – שירות אחסון האתר שבאמצעותו האתר מתארח ומוגש לגולשים.",
                "רשויות מוסמכות – ככל שנידרש לכך על-פי דין או צו שיפוטי.",
              ].map((p) => (
                <li key={p} className="flex gap-2.5 text-muted">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black">עוגיות (Cookies) וכלי מדידה</h2>
            <p className="mt-4 text-muted">
              האתר עשוי לעשות שימוש בעוגיות ובטכנולוגיות דומות לצורך תפעול תקין, שמירת העדפות
              (כגון הגדרות הנגישות) וניתוח סטטיסטי. בעת הכניסה הראשונה לאתר מוצגת הודעה על כך.
              ניתן לחסום או למחוק עוגיות דרך הגדרות הדפדפן, אך ייתכן שחלק מהפונקציות לא יפעלו
              כראוי כתוצאה מכך.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">שמירת המידע ואבטחתו</h2>
            <p className="mt-4 text-muted">
              המידע נשמר לפרק הזמן הנדרש למימוש המטרות שלשמן נאסף, או בהתאם לחובות שמירה על-פי
              דין, ולאחר מכן נמחק או מונגש באופן שאינו מזהה. אנו נוקטים אמצעים סבירים לאבטחת
              המידע ולצמצום הסיכון לשימוש לרעה, לחשיפה או לגישה בלתי-מורשית. עם זאת, אין באפשרותנו
              להבטיח חסינות מוחלטת מפני חדירה או שימוש לא מורשה.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">הזכויות שלכם</h2>
            <p className="mt-4 text-muted">
              בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981 ותיקון 13 לחוק, עומדות לכם, בין היתר,
              הזכויות הבאות:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {dataRights.map((r) => (
                <div key={r.title} className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="font-bold text-foreground">{r.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{r.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-muted">
              למימוש זכויותיכם ניתן לפנות אלינו בפרטי יצירת הקשר המופיעים למטה. נטפל בפנייתכם
              בהתאם להוראות הדין ובתוך פרק זמן סביר.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">דיוור פרסומי והסרה ממנו</h2>
            <p className="mt-4 text-muted">
              נשלח אליכם דיוור פרסומי רק אם נתתם לכך את הסכמתכם המפורשת (למשל באמצעות סימון תיבת
              ההסכמה בטופס). בכל הודעת דיוור תופיע אפשרות פשוטה להסרה, וניתן להודיע לנו בכל עת
              על רצונכם להפסיק לקבל דיוור – והבקשה תכובד ללא עלות.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">יצירת קשר בנושא פרטיות</h2>
            <p className="mt-4 text-muted">
              בכל שאלה או בקשה בנוגע למדיניות זו או למידע האישי שלכם, ניתן לפנות אלינו:
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={telLink(site.phone)}
                className="inline-flex min-h-[44px] items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
              >
                חייגו {site.phone}
              </a>
              <a
                href={whatsappLink("היי, יש לי שאלה בנושא פרטיות ומדיניות המידע")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
              >
                שליחת וואטסאפ
              </a>
              {privacyEmail && (
                <a
                  href={`mailto:${privacyEmail}`}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-cream"
                >
                  דוא&quot;ל
                </a>
              )}
            </div>
          </div>

          {updated && (
            <p className="border-t border-border pt-6 text-sm text-muted">
              מדיניות הפרטיות עודכנה לאחרונה: {updated}. אנו רשאים לעדכן מדיניות זו מעת לעת;
              הגרסה המעודכנת תפורסם בעמוד זה.
            </p>
          )}

          <p className="text-sm text-muted">
            ראו גם את{" "}
            <Link href="/accessibility/" className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark">
              הצהרת הנגישות
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
