const WAZE_URL = "https://waze.com/ul?q=הקישון%205%20יבנה&navigate=yes";
const GMAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=הקישון%205%20יבנה";

// Direct-navigation buttons for the contact/map section. Styled for the dark
// hero-glow background used in that section.
export default function NavButtons({ className = "" }: { className?: string }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 min-h-[44px] text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/20 transition";
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a href={WAZE_URL} target="_blank" rel="noopener noreferrer" className={base}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        ניווט ב‑Waze
      </a>
      <a href={GMAPS_URL} target="_blank" rel="noopener noreferrer" className={base}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        ניווט ב‑Google Maps
      </a>
    </div>
  );
}
