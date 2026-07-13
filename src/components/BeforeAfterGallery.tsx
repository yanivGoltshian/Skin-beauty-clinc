"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import type { BeforeAfterPair } from "@/lib/types";

function BeforeAfterItem({ pair }: { pair: BeforeAfterPair }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
  };

  return (
    <figure className="overflow-hidden rounded-2xl ring-1 ring-border bg-cream card-elegant">
      <div
        ref={ref}
        className="relative aspect-[4/5] w-full cursor-ew-resize select-none touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* base layer: BEFORE */}
        <Image
          src={asset(pair.before)}
          alt={`לפני – ${pair.label}`}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          draggable={false}
        />
        {/* revealed layer: AFTER, clipped from the physical-left edge to `pos` */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image
            src={asset(pair.after)}
            alt={`אחרי – ${pair.label}`}
            fill
            className="object-cover pointer-events-none"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            draggable={false}
          />
        </div>

        {/* corner labels */}
        <span className="absolute top-2 right-2 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-white">
          לפני
        </span>
        <span className="absolute top-2 left-2 rounded-full bg-eco/90 px-2.5 py-1 text-[11px] font-semibold text-white">
          אחרי
        </span>

        {/* divider + draggable handle */}
        <div className="absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ left: `${pos}%` }} />
        <button
          type="button"
          role="slider"
          aria-label={`השוואת לפני ואחרי – ${pair.label}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand shadow-lg ring-1 ring-border cursor-ew-resize"
          style={{ left: `${pos}%` }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m15 6-6 6 6 6M9 6l-6 6 6 6" transform="translate(3 0)" />
          </svg>
        </button>
      </div>
      <figcaption className="px-3 py-2.5 text-center text-sm font-medium text-foreground/80">{pair.label}</figcaption>
    </figure>
  );
}

export default function BeforeAfterGallery({ pairs }: { pairs: BeforeAfterPair[] }) {
  if (!pairs?.length) return null;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map((p) => (
          <BeforeAfterItem key={`${p.before}-${p.after}-${p.label}`} pair={p} />
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-muted">התמונות מפורסמות באישור המטופלות</p>
    </div>
  );
}
