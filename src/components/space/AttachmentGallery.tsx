"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiChevronLeft, HiChevronRight, HiOutlineDocument, HiOutlineDownload, HiX } from "react-icons/hi";
import type { Attachment } from "@/lib/logbook";

const formatSize = (bytes?: number) =>
  !bytes ? "" : bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

// Image grid with a full-screen viewer, plus PDFs that can be read inline
export default function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  const images = attachments.filter((a) => a.type === "image");
  const docs = attachments.filter((a) => a.type !== "image");
  const [open, setOpen] = useState<number | null>(null);
  const [reading, setReading] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <div className={`grid gap-3 ${images.length === 1 ? "" : "sm:grid-cols-2"}`}>
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setOpen(i)}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white/[0.03] text-left"
              aria-label={`Open ${img.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} loading="lazy" className="w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
              <span className="hud absolute bottom-2 left-2 rounded-full bg-void/70 px-2 py-1 !text-[10px] backdrop-blur">
                Page {i + 1}/{images.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {docs.map((doc) => (
        <div key={doc.url} className="glass overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <HiOutlineDocument className="text-2xl text-sky" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-star">{doc.name}</p>
              <p className="hud !text-[10px]">{doc.type === "pdf" ? "PDF" : "File"} {formatSize(doc.size) && `· ${formatSize(doc.size)}`}</p>
            </div>
            {doc.type === "pdf" && (
              <button
                onClick={() => setReading(reading === doc.url ? null : doc.url)}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-star transition hover:border-mint/50 hover:text-mint"
              >
                {reading === doc.url ? "Close" : "Read here"}
              </button>
            )}
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1.5 text-xs font-semibold text-void"
            >
              <HiOutlineDownload /> Open
            </a>
          </div>
          {reading === doc.url && <iframe src={doc.url} title={doc.name} className="h-[80vh] w-full border-t border-line bg-white" />}
        </div>
      ))}

      {open !== null && <Lightbox images={images} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Lightbox({ images, index, onChange, onClose }: { images: Attachment[]; index: number; onChange: (i: number) => void; onClose: () => void }) {
  const go = useCallback((d: number) => onChange((index + d + images.length) % images.length), [index, images.length, onChange]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  const img = images[index];
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void/95 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={img.name} onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.url} alt={img.name} className="max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-line bg-void/70 text-xl text-star">
        <HiX />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous page" className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-void/70 text-xl text-star">
            <HiChevronLeft />
          </button>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next page" className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-void/70 text-xl text-star">
            <HiChevronRight />
          </button>
          <p className="hud absolute bottom-4 left-1/2 -translate-x-1/2">Page {index + 1} / {images.length}</p>
        </>
      )}
    </div>,
    document.body
  );
}
