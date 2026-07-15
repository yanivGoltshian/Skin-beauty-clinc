"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Floating accessibility menu (תפריט נגישות) required alongside real code-level
// a11y for IS 5568 AA. Offers font sizing, high-contrast, link highlighting, a
// readable font, and motion stop. Choices persist in localStorage and are
// applied as classes / font-size on <html> (styling lives in globals.css).
//
// Positioning: bottom-RIGHT so it never overlaps the WhatsApp FAB (bottom-left)
// or the mobile sticky CTA bar (offset up on mobile via bottom-24, back to
// bottom-5 on lg). Fully keyboard operable: Esc closes, outside-click closes,
// focus moves into the panel on open and back to the trigger on close.

const STORAGE_KEY = "sbc-a11y-settings";
const FONT_MIN = 90;
const FONT_MAX = 150;
const FONT_STEP = 10;

type Settings = {
  font: number;
  contrast: boolean;
  links: boolean;
  readable: boolean;
  stopMotion: boolean;
};

const DEFAULTS: Settings = {
  font: 100,
  contrast: false,
  links: false,
  readable: false,
  stopMotion: false,
};

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstControlRef = useRef<HTMLButtonElement>(null);

  // Load persisted settings after hydration (keeps SSR and first client render
  // identical, avoiding a hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Apply settings to <html> and persist. Gated on `hydrated` so the initial
  // default pass can't overwrite stored values before they load.
  useEffect(() => {
    if (!hydrated) return;
    const html = document.documentElement;
    html.style.fontSize = settings.font === 100 ? "" : `${settings.font}%`;
    html.classList.toggle("a11y-contrast", settings.contrast);
    html.classList.toggle("a11y-links", settings.links);
    html.classList.toggle("a11y-readable", settings.readable);
    html.classList.toggle("a11y-stop-motion", settings.stopMotion);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [hydrated, settings]);

  // Esc + outside-click close the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) firstControlRef.current?.focus();
  }, [open]);

  const setFont = (dir: 1 | -1) =>
    setSettings((s) => ({
      ...s,
      font: Math.min(FONT_MAX, Math.max(FONT_MIN, s.font + dir * FONT_STEP)),
    }));

  const toggle = (key: keyof Omit<Settings, "font">) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const reset = () => setSettings(DEFAULTS);

  const toggleRows: {
    key: keyof Omit<Settings, "font">;
    label: string;
    ref?: React.RefObject<HTMLButtonElement | null>;
  }[] = [
    { key: "contrast", label: "ניגודיות גבוהה" },
    { key: "links", label: "הדגשת קישורים" },
    { key: "readable", label: "גופן קריא" },
    { key: "stopMotion", label: "עצירת אנימציות" },
  ];

  return (
    <div className="print:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="תפריט נגישות"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="a11y-panel"
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-brand text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark lg:bottom-5"
      >
        {/* Universal accessibility glyph */}
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 5.5c0 .62-.46 1.08-1.1 1.18l-4.9.82v3.1l1.86 5.57a1.1 1.1 0 0 1-2.08.7L13 15.2l-1.68 3.47a1.1 1.1 0 0 1-2.08-.7L11.1 12.6V8.9l-6.9-1.15A1.15 1.15 0 0 1 4.4 5.5c.1-.6.66-1 1.28-.9L11 5.55c.66.1 1.34.1 2 0l5.32-.95c.62-.1 1.18.3 1.28.9.06.35.06.7.4 1z" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-label="תפריט נגישות"
          className="fixed bottom-40 right-5 z-50 w-72 max-w-[calc(100vw-2.5rem)] max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-surface p-4 text-right shadow-2xl shadow-ink/20 lg:bottom-20"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">תפריט נגישות</h2>
            <button
              ref={firstControlRef}
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="סגירת תפריט הנגישות"
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Font size */}
          <div className="mb-3">
            <p className="mb-1.5 text-sm font-semibold text-foreground">גודל טקסט</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFont(-1)}
                disabled={settings.font <= FONT_MIN}
                aria-label="הקטנת גודל הטקסט"
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-border bg-cream text-lg font-bold text-foreground transition hover:bg-brand hover:text-white disabled:opacity-40 disabled:hover:bg-cream disabled:hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
              >
                A−
              </button>
              <span className="min-w-[3.5rem] text-center text-sm font-semibold tabular-nums text-foreground" aria-live="polite">
                {settings.font}%
              </span>
              <button
                type="button"
                onClick={() => setFont(1)}
                disabled={settings.font >= FONT_MAX}
                aria-label="הגדלת גודל הטקסט"
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-border bg-cream text-lg font-bold text-foreground transition hover:bg-brand hover:text-white disabled:opacity-40 disabled:hover:bg-cream disabled:hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
              >
                A+
              </button>
            </div>
          </div>

          {/* Toggles */}
          <ul className="space-y-2">
            {toggleRows.map((row) => {
              const active = settings[row.key];
              return (
                <li key={row.key}>
                  <button
                    type="button"
                    onClick={() => toggle(row.key)}
                    aria-pressed={active}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-cream text-foreground hover:border-brand"
                    }`}
                  >
                    <span>{row.label}</span>
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        active ? "border-white bg-white/20" : "border-foreground/40"
                      }`}
                    >
                      {active ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
          >
            איפוס הגדרות נגישות
          </button>

          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            <Link
              href="/accessibility/"
              className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
            >
              להצהרת הנגישות המלאה
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
