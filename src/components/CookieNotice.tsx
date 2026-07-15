"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// First-visit cookie / tracking notice. Informational for now (no pixels are
// installed yet) with a link to the full privacy policy, built so it's ready
// once Meta/Google tags are added. Dismissal persists in localStorage.
//
// Positioning avoids every other floating element: a full-width bar pinned to
// the bottom on mobile (the WhatsApp FAB / a11y button sit higher at bottom-24,
// and it layers above the sticky CTA bar via z-[70]); a centered card clear of
// both bottom corners on desktop.

const STORAGE_KEY = "sbc-cookie-notice";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "dismissed") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="הודעת עוגיות ופרטיות"
      className="fixed inset-x-0 bottom-0 z-[70] print:hidden lg:inset-x-auto lg:left-1/2 lg:bottom-6 lg:-translate-x-1/2 lg:w-full lg:max-w-xl lg:px-0"
    >
      <div className="border-t border-border bg-surface/98 px-4 py-3.5 shadow-[0_-6px_24px_-10px_rgba(33,28,26,0.4)] backdrop-blur-md lg:rounded-2xl lg:border lg:shadow-2xl lg:shadow-ink/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-right sm:flex-row sm:items-center sm:justify-between lg:max-w-none">
          <p className="text-sm leading-relaxed text-foreground">
            אנחנו משתמשים בעוגיות ובכלי מדידה כדי לשפר את חוויית הגלישה ולהתאים את
            השירות. בהמשך הגלישה באתר את/ה מאשר/ת זאת. פרטים נוספים ב
            <Link
              href="/privacy/"
              className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
            >
              מדיניות הפרטיות
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
          >
            הבנתי
          </button>
        </div>
      </div>
    </div>
  );
}
