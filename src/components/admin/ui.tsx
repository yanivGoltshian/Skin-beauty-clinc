"use client";

// Shared UI kit for the admin — mobile-first, RTL Hebrew, clinic brand
// (taupe/tan) reusing the site's global CSS tokens.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ------------------------------------------------------------------- toasts --

type Toast = { id: number; kind: "success" | "error" | "info"; text: string };
type ToastCtx = { push: (kind: Toast["kind"], text: string) => void };
const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 backdrop-blur transition",
              t.kind === "success" && "bg-emerald-600/95 text-white ring-emerald-700",
              t.kind === "error" && "bg-rose-600/95 text-white ring-rose-700",
              t.kind === "info" && "bg-ink/95 text-white ring-black/20"
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) return { push: () => {} };
  return ctx;
}

// ------------------------------------------------------------------ section --

export function Section({
  title,
  hint,
  badge,
  defaultOpen = false,
  children,
  preview,
}: {
  title: string;
  hint?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  preview?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showPreview, setShowPreview] = useState(true);
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-right transition hover:bg-cream-2/60"
        aria-expanded={open}
      >
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition",
            open && "rotate-180"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-foreground">{title}</span>
            {badge}
          </span>
          {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
        </span>
      </button>

      {open && (
        <div className="border-t border-border">
          <div className="grid gap-4 p-4 md:grid-cols-2 md:items-start">
            <div className="grid gap-4 content-start">{children}</div>
            {preview && (
              <div className="md:sticky md:top-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">תצוגה מקדימה</span>
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className="text-xs font-medium text-brand md:hidden"
                  >
                    {showPreview ? "הסתר" : "הצג"}
                  </button>
                </div>
                <div className={cn("rounded-2xl border border-border bg-cream/40 p-3", !showPreview && "hidden md:block")}>
                  {preview}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------- fields --

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "min-h-[88px] leading-relaxed", props.className)} />;
}

// ------------------------------------------------------------------ button ---

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: {
  variant?: "primary" | "ghost" | "danger" | "soft";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-gradient-to-l from-brand to-brand-dark text-white shadow-sm hover:brightness-110",
        variant === "soft" && "bg-brand/10 text-brand hover:bg-brand/20",
        variant === "ghost" && "border border-border bg-white text-foreground hover:border-brand hover:text-brand",
        variant === "danger" && "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
        className
      )}
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------------ toggle ---

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-brand" : "bg-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "right-0.5" : "right-[22px]"
          )}
        />
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------- repeater ---

export function Repeater<T>({
  items,
  onChange,
  render,
  makeNew,
  addLabel = "הוסף פריט",
  itemLabel = (i) => `פריט ${i + 1}`,
  minItems = 0,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (v: T) => void, index: number) => ReactNode;
  makeNew: () => T;
  addLabel?: string;
  itemLabel?: (index: number) => string;
  minItems?: number;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border bg-cream/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">{itemLabel(i)}</span>
            <div className="flex items-center gap-1">
              <IconBtn label="הזז מעלה" onClick={() => move(i, i - 1)} disabled={i === 0}>
                <path d="M6 15l6-6 6 6" />
              </IconBtn>
              <IconBtn label="הזז מטה" onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>
                <path d="M6 9l6 6 6-6" />
              </IconBtn>
              <IconBtn
                label="מחק"
                danger
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                disabled={items.length <= minItems}
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </IconBtn>
            </div>
          </div>
          {render(item, (v) => onChange(items.map((it, j) => (j === i ? v : it))), i)}
        </div>
      ))}
      <Button variant="soft" type="button" onClick={() => onChange([...items, makeNew()])}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {addLabel}
      </Button>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-lg border transition disabled:opacity-30",
        danger
          ? "border-rose-200 bg-white text-rose-500 hover:bg-rose-50"
          : "border-border bg-white text-muted hover:text-brand hover:border-brand"
      )}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {children}
      </svg>
    </button>
  );
}

// ------------------------------------------------------------- string list ---

// Simple editable list of plain strings (paragraphs, bullets, features…).
export function StringList({
  items,
  onChange,
  addLabel = "הוסף שורה",
  multiline = false,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <Repeater<string>
      items={items}
      onChange={onChange}
      makeNew={() => ""}
      addLabel={addLabel}
      itemLabel={(i) => `#${i + 1}`}
      render={(val, update) =>
        multiline ? (
          <TextArea value={val} placeholder={placeholder} onChange={(e) => update(e.target.value)} />
        ) : (
          <TextInput value={val} placeholder={placeholder} onChange={(e) => update(e.target.value)} />
        )
      }
    />
  );
}

// ------------------------------------------------------------- chip select ---

// Multi-select of item ids, order-preserving (used for product/category refs).
export function ChipSelect({
  value,
  options,
  onChange,
  emptyText = "לא נבחרו פריטים",
}: {
  value: string[];
  options: { id: string; label: string }[];
  onChange: (v: string[]) => void;
  emptyText?: string;
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {value.length === 0 && <span className="text-xs text-muted">{emptyText}</span>}
        {value.map((id, i) => {
          const opt = options.find((o) => o.id === id);
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand"
            >
              <span className="text-brand/60">{i + 1}.</span>
              {opt?.label ?? id}
              <button type="button" onClick={() => toggle(id)} aria-label="הסר" className="text-brand/60 hover:text-brand">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition",
              value.includes(o.id)
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-muted hover:border-brand/50"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ savebar --

export type SaveState = "idle" | "saving" | "publishing" | "saved" | "error";

export function SaveBar({
  dirty,
  state,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  state: SaveState;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-30 -mx-3 mt-4 border-t border-border bg-white/95 px-3 py-3 backdrop-blur md:-mx-4 md:px-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 text-xs">
          {state === "publishing" && (
            <span className="inline-flex items-center gap-1.5 font-medium text-brand">
              <Spinner /> מתפרסם… (עד 3 דקות)
            </span>
          )}
          {state === "saving" && (
            <span className="inline-flex items-center gap-1.5 font-medium text-brand">
              <Spinner /> שומר…
            </span>
          )}
          {state === "saved" && !dirty && <span className="font-medium text-emerald-600">נשמר ✓</span>}
          {state === "error" && <span className="font-medium text-rose-600">שגיאה בשמירה</span>}
          {dirty && state === "idle" && <span className="font-medium text-amber-600">יש שינויים שלא נשמרו</span>}
          {!dirty && state === "idle" && <span className="text-muted">אין שינויים</span>}
        </div>
        <Button variant="ghost" type="button" onClick={onDiscard} disabled={!dirty || state === "saving"}>
          בטל שינויים
        </Button>
        <Button type="button" onClick={onSave} disabled={!dirty || state === "saving" || state === "publishing"}>
          שמור ופרסם
        </Button>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ------------------------------------------------------------------- modal ---

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === ref.current && onClose()}
      ref={ref}
    >
      <div
        className={cn(
          "max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-cream-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function useAutoId(prefix: string) {
  const id = useId();
  return `${prefix}-${id}`;
}
