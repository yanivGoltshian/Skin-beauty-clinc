"use client";

// Image / video picker with a focal-point crop editor. Because the public
// components use a plain `object-cover` (center) and cannot be changed, the
// focal editor BAKES the crop into the committed JPEG at the section aspect
// ratio — that is the only way framing is reflected on the static site.

import { useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import {
  processImageFile,
  recropExisting,
  processVideoFile,
  writeBinary,
  cachedBackend,
} from "@/lib/adminClient";
import { Button, Modal, Spinner, cn, useToast } from "./ui";

// Section aspect ratios (width / height) taken from the live components.
export const ASPECT = {
  hero: 16 / 9,
  introGallery: 16 / 9,
  hotDeals: 1,
  product: 1, // ProductCard uses aspect-square
  bagType: 16 / 10,
  branded: 4 / 3,
  diagnosis: 4 / 3,
  mosaic: 1,
} as const;

function publicToRepo(publicPath: string): string {
  const clean = publicPath.replace(/^\//, "");
  return clean.startsWith("public/") ? clean : `public/${clean}`;
}
function repoToPublic(repoPath: string): string {
  return "/" + repoPath.replace(/^public\//, "");
}

let uid = 0;
function uniqueRepoPath(folder: string, prefix: string, ext: string): string {
  uid += 1;
  const stamp = `${Date.now().toString(36)}${uid}`;
  const slug = (prefix || "img").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "img";
  const base = folder.replace(/\/$/, "");
  return `${base}/${slug}-${stamp}.${ext}`;
}

type Common = {
  label?: string;
  aspect: number;
  /** current public path ("/images/...") or "" */
  value: string;
};

type FixedProps = Common & {
  mode: "fixed";
  /** exact repo path to overwrite, e.g. public/images/promos/x.jpg */
  repoPath: string;
  kind?: "image" | "video";
  onSaved?: () => void;
};

type AssetProps = Common & {
  mode: "asset";
  /** repo folder for new uploads, e.g. public/images/treatments */
  folder: string;
  namePrefix: string;
  onChange: (publicPath: string) => void;
};

type Props = FixedProps | AssetProps;

export default function ImagePicker(props: Props) {
  const { label, aspect, value } = props;
  const kind = props.mode === "fixed" ? props.kind ?? "image" : "image";
  const toast = useToast();

  const [publishing, setPublishing] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [bust, setBust] = useState(() => Date.now());
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const displaySrc = value ? `${asset(value)}?t=${bust}` : "";
  const isGithub = cachedBackend() === "github";

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (kind === "video") {
      void uploadVideo(f);
      return;
    }
    setPendingFile(f);
    setEditorOpen(true);
  };

  const uploadVideo = async (f: File) => {
    if (props.mode !== "fixed") return;
    if (f.size > 25 * 1024 * 1024) {
      toast.push("error", "הסרטון גדול מדי (מקסימום 25MB). כדאי לדחוס אותו קודם.");
      return;
    }
    try {
      setPublishing(true);
      const { base64, previewUrl } = await processVideoFile(f);
      await writeBinary(props.repoPath, base64, `admin: replace video ${props.repoPath}`);
      setLocalPreview(previewUrl);
      setBust(Date.now());
      toast.push("success", isGithub ? "הסרטון הועלה — מתפרסם…" : "הסרטון הוחלף");
      props.onSaved?.();
      if (!isGithub) setPublishing(false);
    } catch (err) {
      setPublishing(false);
      toast.push("error", err instanceof Error ? err.message : "העלאה נכשלה");
    }
  };

  const commit = async (base64: string, previewUrl: string) => {
    try {
      setPublishing(true);
      let repoPath: string;
      if (props.mode === "fixed") {
        repoPath = props.repoPath;
      } else {
        repoPath = uniqueRepoPath(props.folder, props.namePrefix, "jpg");
      }
      await writeBinary(repoPath, base64, `admin: update image ${repoPath}`);
      setLocalPreview(previewUrl);
      setImgError(false);
      setBust(Date.now());
      if (props.mode === "asset") props.onChange(repoToPublic(repoPath));
      else props.onSaved?.();
      toast.push("success", isGithub ? "התמונה הועלתה — מתפרסם…" : "התמונה עודכנה");
      if (!isGithub) setPublishing(false);
    } catch (err) {
      setPublishing(false);
      toast.push("error", err instanceof Error ? err.message : "העלאה נכשלה");
    }
  };

  const previewSrc = localPreview ?? (imgError ? null : displaySrc || null);

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-cream-2"
        style={{ aspectRatio: String(aspect) }}
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt=""
            className="h-full w-full object-cover"
            onError={() => {
              if (!localPreview) setImgError(true);
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-center text-xs text-muted">
            {imgError ? "התמונה עדיין מתפרסמת…" : "אין תמונה"}
          </div>
        )}

        {publishing && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand shadow">
              <Spinner /> {isGithub ? "מתפרסם… (עד 3 דקות)" : "שומר…"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="soft" type="button" onClick={() => fileRef.current?.click()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 3v13M7 8l5-5 5 5" />
          </svg>
          {kind === "video" ? "החלף סרטון" : value ? "החלף תמונה" : "העלה תמונה"}
        </Button>
        {kind === "image" && value && (
          <Button variant="ghost" type="button" onClick={() => setEditorOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2" />
            </svg>
            מיקוד וחיתוך
          </Button>
        )}
      </div>
      {kind === "video" && (
        <p className="mt-1 text-xs text-muted">MP4 עד 25MB. מומלץ סרטון אנכי קצר.</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={kind === "video" ? "video/mp4,video/*" : "image/*"}
        className="hidden"
        onChange={onPick}
      />

      {editorOpen && (
        <CropFocusEditor
          aspect={aspect}
          file={pendingFile}
          existingSrc={displaySrc}
          onCancel={() => {
            setEditorOpen(false);
            setPendingFile(null);
          }}
          onConfirm={async (base64, previewUrl) => {
            setEditorOpen(false);
            setPendingFile(null);
            await commit(base64, previewUrl);
          }}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------ crop editor ---

function CropFocusEditor({
  aspect,
  file,
  existingSrc,
  onCancel,
  onConfirm,
}: {
  aspect: number;
  file: File | null;
  existingSrc: string;
  onCancel: () => void;
  onConfirm: (base64: string, previewUrl: string) => void | Promise<void>;
}) {
  const [srcUrl, setSrcUrl] = useState<string>("");
  const [focal, setFocal] = useState({ x: 0.5, y: 0.5 });
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (file) {
      const u = URL.createObjectURL(file);
      setSrcUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setSrcUrl(existingSrc);
  }, [file, existingSrc]);

  const setFromEvent = useCallback((clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    setFocal({ x, y });
  }, []);

  const confirm = async () => {
    try {
      setBusy(true);
      const opts = { aspect, focal, maxW: 1600, quality: 0.85 };
      const res = file
        ? await processImageFile(file, opts)
        : await recropExisting(existingSrc, opts);
      await onConfirm(res.base64, res.previewUrl);
    } catch (err) {
      setBusy(false);
      toast.push("error", err instanceof Error ? err.message : "עיבוד נכשל");
    }
  };

  return (
    <Modal open onClose={onCancel} title="מיקוד וחיתוך התמונה" wide>
      <p className="mb-3 text-sm text-muted">
        גררו את הנקודה למקום החשוב בתמונה. כך היא תיחתך ותוצג באתר בדיוק במסגרת הזו.
      </p>
      <div
        ref={boxRef}
        className={cn(
          "relative mx-auto w-full max-w-md cursor-crosshair select-none overflow-hidden rounded-2xl border border-border bg-cream-2 touch-none",
          dragging && "ring-2 ring-brand"
        )}
        style={{ aspectRatio: String(aspect) }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setDragging(true);
          setFromEvent(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && setFromEvent(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {srcUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={srcUrl}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${focal.x * 100}% ${focal.y * 100}%` }}
          />
        )}
        <span
          className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand/40 shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
          style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={busy}>
          ביטול
        </Button>
        <Button type="button" onClick={confirm} disabled={busy || !srcUrl}>
          {busy ? (
            <>
              <Spinner /> מעבד…
            </>
          ) : (
            "שמור תמונה"
          )}
        </Button>
      </div>
    </Modal>
  );
}
