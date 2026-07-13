"use client";

import { useEffect, useState } from "react";
import { homepage } from "@/lib/data";
import type { HomepageCro } from "@/lib/types";

const STORAGE_KEY = "sbc-launch-banner-dismissed";
const offer = (homepage as HomepageCro).launchOffer;

function useCountdown(endsAt?: string) {
  const [label, setLabel] = useState<string>("");
  useEffect(() => {
    if (!endsAt) return;
    const end = new Date(`${endsAt}T23:59:59`).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (Number.isNaN(end) || diff <= 0) {
        setLabel("");
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      setLabel(`נותרו ${days} ימים ו‑${hours} שעות`);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [endsAt]);
  return label;
}

export default function LaunchBanner() {
  const [dismissed, setDismissed] = useState(false);
  const countdown = useCountdown(offer?.endsAt);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!offer || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative bg-gradient-to-l from-brand-dark via-brand to-brand-dark text-white">
      <div className="mx-auto flex min-h-[44px] max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-10 py-2 text-center text-xs sm:text-sm">
        <span className="font-semibold">{offer.text}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 font-semibold text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
          נותרו {offer.spotsLeft} מקומות במחירי השקה
        </span>
        {countdown && (
          <span className="text-white/85">
            <span className="opacity-40" aria-hidden="true">· </span>
            {countdown}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="סגירת ההודעה"
        className="absolute inset-y-0 left-1 my-auto flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
