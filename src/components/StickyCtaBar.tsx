"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/data";
import { asset } from "@/lib/asset";

// Mobile-only sticky action bar. Appears once the visitor scrolls past the
// hero fold and offers the two highest-value actions side by side.
export default function StickyCtaBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // "past the hero" ≈ scrolled more than ~60% of the viewport height
      setShow(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToLead = (e: React.MouseEvent) => {
    const el = typeof document !== "undefined" ? document.getElementById("lead") : null;
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
    // otherwise fall through to the href (navigate home to the lead form)
  };

  return (
    <>
      {/* Always-present spacer reserves the bar height so nothing shifts when it
          toggles and page content is never hidden behind the bar. */}
      <div aria-hidden className="h-[68px] lg:hidden" />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-border bg-surface/95 backdrop-blur-md shadow-[0_-6px_20px_-8px_rgba(33,28,26,0.35)] transition-transform duration-300 ${
          show ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-6xl items-stretch gap-2.5 px-3 py-2.5">
          <a
            href={whatsappLink("היי, אשמח לקבוע תור / בדיקת התאמה בסקין ביוטי קליניק")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-eco px-3 py-3 min-h-[52px] text-sm font-semibold text-white shadow-sm hover:bg-eco-dark transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 0 0 1.523 5.273l-.999 3.648 3.965-1.04zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            וואטסאפ
          </a>
          <a
            href={`${asset("/")}#lead`}
            onClick={scrollToLead}
            className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-l from-brand to-brand-dark px-3 py-3 min-h-[52px] text-center text-sm font-semibold text-white shadow-sm hover:brightness-110 transition"
          >
            קבעי בדיקת התאמה חינם
          </a>
        </div>
      </div>
    </>
  );
}
