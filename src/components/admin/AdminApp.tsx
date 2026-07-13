"use client";

// Admin shell — passcode gate → (prod) PAT gate → tabbed editors that mirror
// the homepage. Full-screen overlay (layout wraps every route with the public
// header/footer, so the admin paints over them). Mobile-first RTL Hebrew.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Site, Homepage, Product, Category } from "@/lib/types";
import { asset } from "@/lib/asset";
import {
  ADMIN_PASSCODE,
  PATHS,
  type Backend,
  detectBackend,
  isPasscodeOk,
  setPasscodeOk,
  getToken,
  setToken,
  clearToken,
  loadSite,
  loadHomepage,
  loadProducts,
  loadCategories,
  mergeSaveObject,
  patchArray,
  saveDraft,
  loadDraft,
  clearDraft,
  type Draft,
} from "@/lib/adminClient";
import {
  ToastProvider,
  useToast,
  Button,
  TextInput,
  Field,
  Spinner,
  SaveBar,
  type SaveState,
  cn,
} from "./ui";
import HomeEditor from "./HomeEditor";
import TreatmentsEditor, { validateProducts } from "./TreatmentsEditor";
import CategoriesEditor, { validateCategories } from "./CategoriesEditor";
import SiteEditor, { validateSite } from "./SiteEditor";

type DB = { site: Site; homepage: Homepage; products: Product[]; categories: Category[] };
type TabId = "home" | "treatments" | "categories" | "site";
type Phase = "loading" | "passcode" | "pat" | "ready" | "error";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "דף הבית", icon: <path d="M3 9.5 12 3l9 6.5V21H3z" /> },
  { id: "treatments", label: "טיפולים", icon: <path d="M4 7h16M4 12h16M4 17h10" /> },
  { id: "categories", label: "קטגוריות", icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  { id: "site", label: "הגדרות", icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Per-item patch: apply our add/edit/delete diff onto whatever is on disk now,
// leaving items nobody touched intact (lost-update safety across sessions).
function applyItemDiff<T extends { id: string }>(disk: T[], baseline: T[], current: T[]): T[] {
  const baseIds = new Set(baseline.map((x) => x.id));
  const curById = new Map(current.map((x) => [x.id, x]));
  const diskIds = new Set(disk.map((x) => x.id));
  let out = disk
    .map((item) => (curById.has(item.id) ? curById.get(item.id)! : item))
    .filter((item) => !(baseIds.has(item.id) && !curById.has(item.id)));
  for (const c of current) if (!diskIds.has(c.id)) out.push(c);
  return out;
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <AdminInner />
    </ToastProvider>
  );
}

function AdminInner() {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>("loading");
  const [backend, setBackend] = useState<Backend | null>(null);
  const [db, setDb] = useState<DB | null>(null);
  const [baseline, setBaseline] = useState<DB | null>(null);
  const [tab, setTab] = useState<TabId>("home");
  const [saveState, setSaveState] = useState<Record<TabId, SaveState>>({
    home: "idle",
    treatments: "idle",
    categories: "idle",
    site: "idle",
  });
  const [draftPrompt, setDraftPrompt] = useState<Draft | null>(null);

  // Gate inputs
  const [passInput, setPassInput] = useState("");
  const [patInput, setPatInput] = useState("");

  const loadAll = useCallback(async () => {
    setPhase("loading");
    try {
      const [site, homepage, products, categories] = await Promise.all([
        loadSite(),
        loadHomepage(),
        loadProducts(),
        loadCategories(),
      ]);
      const fresh: DB = { site, homepage, products, categories };
      setDb(clone(fresh));
      setBaseline(clone(fresh));
      setPhase("ready");
      // offer draft restore if a newer local draft diverges from disk
      const d = loadDraft();
      if (d && (["site", "homepage", "products", "categories"] as const).some((k) => d[k] && !eq(d[k], fresh[k]))) {
        setDraftPrompt(d);
      }
    } catch (e) {
      console.error(e);
      setPhase("error");
    }
  }, []);

  const init = useCallback(async () => {
    const b = await detectBackend();
    setBackend(b);
    if (!isPasscodeOk()) {
      setPhase("passcode");
      return;
    }
    if (b === "github" && !getToken()) {
      setPhase("pat");
      return;
    }
    await loadAll();
  }, [loadAll]);

  useEffect(() => {
    void init();
  }, [init]);

  // Autosave drafts (debounced) while editing.
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (phase !== "ready" || !db) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      saveDraft({ site: db.site, homepage: db.homepage, products: db.products, categories: db.categories });
    }, 800);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [db, phase]);

  const dirty = useMemo(() => {
    if (!db || !baseline) return { home: false, treatments: false, categories: false, site: false };
    return {
      home: !eq(db.homepage, baseline.homepage),
      treatments: !eq(db.products, baseline.products),
      categories: !eq(db.categories, baseline.categories),
      site: !eq(db.site, baseline.site),
    };
  }, [db, baseline]);

  const setState = (t: TabId, s: SaveState) => setSaveState((prev) => ({ ...prev, [t]: s }));

  const finishPublish = (t: TabId) => {
    if (backend === "github") {
      setState(t, "publishing");
      setTimeout(() => setState(t, "saved"), 3000);
    } else {
      setState(t, "saved");
    }
  };

  const save = async (t: TabId) => {
    if (!db || !baseline) return;
    try {
      setState(t, "saving");
      if (t === "home") {
        const merged = await mergeSaveObject(PATHS.homepage, baseline.homepage as unknown as Record<string, unknown>, db.homepage as unknown as Record<string, unknown>, "content: update homepage via admin");
        const h = merged as unknown as Homepage;
        setBaseline((b) => (b ? { ...b, homepage: clone(h) } : b));
        setDb((d) => (d ? { ...d, homepage: clone(h) } : d));
      } else if (t === "site") {
        const err = validateSite(db.site);
        if (err) return failValidation(t, err);
        const merged = await mergeSaveObject(PATHS.site, baseline.site as unknown as Record<string, unknown>, db.site as unknown as Record<string, unknown>, "content: update site settings via admin");
        const s = merged as unknown as Site;
        setBaseline((b) => (b ? { ...b, site: clone(s) } : b));
        setDb((d) => (d ? { ...d, site: clone(s) } : d));
      } else if (t === "treatments") {
        const err = validateProducts(db.products);
        if (err) return failValidation(t, err);
        const base = baseline.products;
        const cur = db.products;
        const next = await patchArray<Product>(PATHS.products, (disk) => applyItemDiff(disk, base, cur), "content: update treatments via admin");
        setBaseline((b) => (b ? { ...b, products: clone(next) } : b));
        setDb((d) => (d ? { ...d, products: clone(next) } : d));
      } else if (t === "categories") {
        const err = validateCategories(db.categories);
        if (err) return failValidation(t, err);
        const base = baseline.categories;
        const cur = db.categories;
        const next = await patchArray<Category>(PATHS.categories, (disk) => applyItemDiff(disk, base, cur), "content: update categories via admin");
        setBaseline((b) => (b ? { ...b, categories: clone(next) } : b));
        setDb((d) => (d ? { ...d, categories: clone(next) } : d));
      }
      clearDraft();
      finishPublish(t);
      toast.push("success", backend === "github" ? "נשמר! מתפרסם באתר תוך 1–3 דקות." : "נשמר בהצלחה.");
    } catch (e) {
      console.error(e);
      setState(t, "error");
      toast.push("error", errMessage(e));
    }
  };

  const failValidation = (t: TabId, msg: string) => {
    setState(t, "idle");
    toast.push("error", msg);
  };

  const discard = (t: TabId) => {
    if (!db || !baseline) return;
    if (t === "home") setDb({ ...db, homepage: clone(baseline.homepage) });
    else if (t === "site") setDb({ ...db, site: clone(baseline.site) });
    else if (t === "treatments") setDb({ ...db, products: clone(baseline.products) });
    else if (t === "categories") setDb({ ...db, categories: clone(baseline.categories) });
    setState(t, "idle");
  };

  const patch = (slice: Partial<DB>) => setDb((d) => (d ? { ...d, ...slice } : d));

  // --------------------------------------------------------------- gates ----

  if (phase === "passcode") {
    return (
      <Shell backend={backend}>
        <GateCard
          title="כניסת מנהל"
          subtitle="הזיני את קוד הכניסה כדי לערוך את האתר"
          onSubmit={() => {
            if (passInput.trim() === ADMIN_PASSCODE) {
              setPasscodeOk(true);
              setPassInput("");
              void init();
            } else {
              toast.push("error", "קוד שגוי, נסי שוב.");
            }
          }}
        >
          <Field label="קוד כניסה">
            <TextInput type="password" value={passInput} onChange={(e) => setPassInput(e.target.value)} autoFocus placeholder="••••••" />
          </Field>
        </GateCard>
      </Shell>
    );
  }

  if (phase === "pat") {
    return (
      <Shell backend={backend}>
        <GateCard
          title="חיבור ל‑GitHub"
          subtitle="הדביקי טוקן אישי (Fine‑grained PAT) עם הרשאת Contents: Read and write על מאגר האתר. הטוקן נשמר רק בדפדפן שלך."
          onSubmit={() => {
            if (!patInput.trim()) return toast.push("error", "יש להדביק טוקן.");
            setToken(patInput.trim());
            setPatInput("");
            void loadAll();
          }}
          submitLabel="התחברי"
        >
          <Field label="GitHub Token" hint="מתחיל ב‑github_pat_ · נשמר ב‑localStorage בדפדפן זה בלבד">
            <TextInput dir="ltr" type="password" value={patInput} onChange={(e) => setPatInput(e.target.value)} autoFocus placeholder="github_pat_…" />
          </Field>
        </GateCard>
      </Shell>
    );
  }

  // Error must be checked BEFORE the loading guard below: on a failed load
  // `db`/`baseline` stay null, so a `!db` check would otherwise keep showing
  // the spinner forever and the error screen would be unreachable.
  if (phase === "error") {
    return (
      <Shell backend={backend}>
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="font-display text-lg font-bold text-rose-700">שגיאה בטעינת התוכן</p>
          <p className="mt-2 text-sm text-rose-600">ייתכן שהטוקן שגוי או שאין חיבור. נסי שוב.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="ghost" onClick={() => void loadAll()}>נסי שוב</Button>
            <Button variant="danger" onClick={() => { clearToken(); void init(); }}>החליפי טוקן</Button>
          </div>
        </div>
      </Shell>
    );
  }

  if (phase === "loading" || !db || !baseline) {
    return (
      <Shell backend={backend}>
        <div className="grid min-h-[50vh] place-items-center text-muted">
          <div className="flex items-center gap-2 text-sm">
            <Spinner /> טוען את תוכן האתר…
          </div>
        </div>
      </Shell>
    );
  }

  // --------------------------------------------------------------- ready ----

  return (
    <Shell
      backend={backend}
      onLogout={() => {
        clearToken();
        setPasscodeOk(false);
        window.location.reload();
      }}
      tabs={
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:px-4" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition",
                tab === t.id ? "bg-brand text-white shadow-sm" : "text-muted hover:bg-cream-2"
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {t.icon}
              </svg>
              {t.label}
              {dirty[t.id] && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-label="שינויים" />}
            </button>
          ))}
        </nav>
      }
    >
      {draftPrompt && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <span className="text-amber-800">נמצאה טיוטה שלא נשמרה מהעריכה הקודמת.</span>
          <div className="flex gap-2">
            <Button
              variant="soft"
              onClick={() => {
                const d = draftPrompt;
                setDb((cur) =>
                  cur
                    ? {
                        site: d.site ?? cur.site,
                        homepage: d.homepage ?? cur.homepage,
                        products: d.products ?? cur.products,
                        categories: d.categories ?? cur.categories,
                      }
                    : cur
                );
                setDraftPrompt(null);
                toast.push("info", "הטיוטה שוחזרה. בדקי ולחצי שמור ופרסם.");
              }}
            >
              שחזרי טיוטה
            </Button>
            <Button variant="ghost" onClick={() => { clearDraft(); setDraftPrompt(null); }}>
              התעלמי
            </Button>
          </div>
        </div>
      )}

      <div hidden={tab !== "home"}>
        <HomeEditor value={db.homepage} products={db.products} onChange={(homepage) => patch({ homepage })} />
        <SaveBar dirty={dirty.home} state={saveState.home} onSave={() => void save("home")} onDiscard={() => discard("home")} />
      </div>
      <div hidden={tab !== "treatments"}>
        <TreatmentsEditor products={db.products} categories={db.categories} onChange={(products) => patch({ products })} />
        <SaveBar dirty={dirty.treatments} state={saveState.treatments} onSave={() => void save("treatments")} onDiscard={() => discard("treatments")} />
      </div>
      <div hidden={tab !== "categories"}>
        <CategoriesEditor categories={db.categories} onChange={(categories) => patch({ categories })} />
        <SaveBar dirty={dirty.categories} state={saveState.categories} onSave={() => void save("categories")} onDiscard={() => discard("categories")} />
      </div>
      <div hidden={tab !== "site"}>
        <SiteEditor value={db.site} onChange={(site) => patch({ site })} />
        <SaveBar dirty={dirty.site} state={saveState.site} onSave={() => void save("site")} onDiscard={() => discard("site")} />
      </div>
    </Shell>
  );
}

// ------------------------------------------------------------------- shell ---

function Shell({
  children,
  backend,
  tabs,
  onLogout,
}: {
  children: React.ReactNode;
  backend: Backend | null;
  tabs?: React.ReactNode;
  onLogout?: () => void;
}) {
  return (
    <div dir="rtl" className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-cream text-foreground">
      <header className="shrink-0 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-3 md:px-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3c1.5 3 4 4.5 7 5-3 .5-5.5 2-7 5-1.5-3-4-4.5-7-5 3-.5 5.5-2 7-5z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-display text-base font-bold leading-none text-brand-dark">ניהול האתר</div>
            <div className="mt-0.5 text-[11px] text-muted">סקין ביוטי קליניק</div>
          </div>
          {backend && (
            <span
              className={cn(
                "hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex",
                backend === "local" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
              )}
              title={backend === "local" ? "עריכה מקומית (מחשב פיתוח)" : "מחובר ל‑GitHub — שמירה מפרסמת לאתר"}
            >
              {backend === "local" ? "מצב מקומי" : "מחובר לאתר"}
            </span>
          )}
          <a
            href={asset("/")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
            </svg>
            <span className="hidden sm:inline">צפייה באתר</span>
          </a>
          {onLogout && (
            <button
              onClick={onLogout}
              aria-label="התנתקי"
              title="התנתקי"
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white text-muted transition hover:border-rose-300 hover:text-rose-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          )}
        </div>
        {tabs && <div className="mx-auto max-w-3xl">{tabs}</div>}
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-3 py-4 md:px-4">{children}</div>
      </main>
    </div>
  );
}

function GateCard({
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "כניסה",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-lg"
      >
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-brand-dark">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>
        <div className="grid gap-3">{children}</div>
        <Button type="submit" className="mt-4 w-full">
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}

function errMessage(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/401|403|Bad credentials/i.test(m)) return "הטוקן שגוי או ללא הרשאה. בדקי את ה‑PAT.";
  if (/409|sha/i.test(m)) return "התוכן עודכן בינתיים. רענני ונסי שוב.";
  if (/network|fetch/i.test(m)) return "בעיית תקשורת. בדקי חיבור אינטרנט.";
  return "שמירה נכשלה: " + m;
}
