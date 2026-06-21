import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/data";
import PageHero from "@/components/PageHero";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "אודות",
  description: "סקין ביוטי קליניק – מרפאת אסתטיקה רפואית ביבנה. טיפולי בוטוקס, מילוי, לייזר, PRP וטיפולי פנים, עם יחס אישי ובדיקת התאמה לפני כל טיפול.",
};

const values = [
  { title: "אסתטיקה רפואית", text: "טיפולים מתקדמים בליווי מקצועי, עם דגש על תוצאה טבעית." },
  { title: "בדיקת התאמה", text: "לפני כל טיפול – אבחון אישי והתאמת הפרוטוקול המדויק עבורכם." },
  { title: "יחס אישי", text: "ליווי צמוד מהייעוץ הראשון ועד התוצאה הסופית." },
  { title: "סטנדרט גבוה", text: "חומרים מקוריים, ציוד מתקדם וסביבה נקייה ובטוחה." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="מי אנחנו"
        title="סקין ביוטי קליניק"
        subtitle="מרפאת אסתטיקה רפואית ביבנה – יופי טבעי, בידיים מקצועיות."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
          <Image src={asset("/images/banners/interior.jpg")} alt="המרפאה שלנו" fill className="object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-black">יופי טבעי, באחריות רפואית</h2>
          <p className="mt-4 text-muted leading-relaxed">
            סקין ביוטי קליניק היא מרפאת אסתטיקה רפואית ביבנה, המציעה מגוון רחב של טיפולים מתקדמים –
            מבוטוקס ומילוי חומצה היאלורונית, דרך עיצוב אף ללא ניתוח, טיפולי RF ולייזר להסרת שיער,
            ועד טיפולי PRP לשיער ולעור וטיפולי פנים מתקדמים.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            כל טיפול מתחיל בבדיקת התאמה אישית. אנחנו מאמינים בתוצאה טבעית, ביחס אישי ובסטנדרט מקצועי גבוה –
            כדי שתרגישו בנוח, בטוחים ומרוצים מהתוצאה.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {site.certifications.map((c) => (
              <span key={c} className="rounded-full bg-surface border border-border px-4 py-2 text-sm font-medium">{c}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-3xl font-black">הערכים שמנחים אותנו</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white border border-border border-t-2 border-t-gold p-6">
                <h3 className="font-display font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
