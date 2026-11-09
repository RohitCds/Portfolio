"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { HiArrowLeft, HiArrowRight, HiBeaker, HiX } from "react-icons/hi";
import { LABS, Lab, LabFigure } from "@/lib/labs";

// A post with its lab alongside: the article scrolls on the left while the lab stays pinned on the
// right and follows the reader from marker to marker. On phones the lab opens as a bottom sheet.
export default function LabReader({ labKey, children }: { labKey: string; children: React.ReactNode }) {
  const lab = LABS[labKey];
  const articleRef = useRef<HTMLDivElement>(null);
  const [frameId, setFrameId] = useState(lab.frames[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);

  // warm the cache so frames swap without waiting on their images
  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const f of lab.frames.flatMap((fr) => fr.figures)) new Image().src = `${lab.media}/${f.src}`;
    }, 1200);
    return () => window.clearTimeout(id);
  }, [lab]);

  // the active frame is the last marker that has scrolled above 40% of the viewport
  useEffect(() => {
    const markers = Array.from(articleRef.current?.querySelectorAll<HTMLElement>("[data-lab-frame]") ?? []);
    if (!markers.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = markers[0].dataset.labFrame!;
      for (const m of markers) {
        if (m.getBoundingClientRect().top <= line) current = m.dataset.labFrame!;
        else break;
      }
      setFrameId((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // jumping to a step scrolls the article to that step's first marker in the text
  const goToStep = useCallback(
    (step: number) => {
      const ids = new Set(lab.frames.filter((f) => f.step === step).map((f) => f.id));
      const target = Array.from(articleRef.current?.querySelectorAll<HTMLElement>("[data-lab-frame]") ?? []).find((m) => ids.has(m.dataset.labFrame!));
      if (target) {
        setSheetOpen(false);
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: "smooth" });
      } else {
        setFrameId(lab.frames.find((f) => f.step === step)!.id);
      }
    },
    [lab]
  );

  const frame = lab.frames.find((f) => f.id === frameId) ?? lab.frames[0];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
      <div ref={articleRef} className="min-w-0">{children}</div>

      <aside className="hidden lg:block" aria-label={`Lab: ${lab.title}`}>
        <div className="glass sticky top-24 flex max-h-[calc(100svh-7.5rem)] flex-col overflow-hidden rounded-3xl">
          <LabPanel lab={lab} frameId={frame.id} onStep={goToStep} />
        </div>
      </aside>

      {/* phones and tablets */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full border border-mint/40 bg-deep/90 py-2 pl-3 pr-4 text-sm text-star shadow-[0_0_24px_rgba(110,242,200,0.25)] backdrop-blur-md lg:hidden"
        aria-label={`Open the lab: ${frame.title}`}
      >
        <HiBeaker className="shrink-0 text-lg text-mint" />
        <span className="hud !text-[10px] text-mint">Lab</span>
        <span className="truncate">{frame.title}</span>
      </button>
      <AnimatePresence>
        {sheetOpen && <LabSheet lab={lab} frameId={frame.id} onStep={goToStep} onClose={() => setSheetOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function LabSheet({ lab, frameId, onStep, onClose }: { lab: Lab; frameId: string; onStep: (step: number) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // portalled so it sits above the nav, outside the page's stacking context
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label={`Lab: ${lab.title}`}>
      <motion.div className="absolute inset-0 bg-void/70 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        className="relative flex max-h-[82svh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-deep"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-star" aria-label="Close the lab">
          <HiX />
        </button>
        <LabPanel lab={lab} frameId={frameId} onStep={onStep} closable />
      </motion.div>
    </div>,
    document.body
  );
}

function LabPanel({ lab, frameId, onStep, closable = false }: { lab: Lab; frameId: string; onStep: (step: number) => void; closable?: boolean }) {
  const reduce = useReducedMotion();
  const frame = lab.frames.find((f) => f.id === frameId) ?? lab.frames[0];
  const step = lab.steps[frame.step];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [frameId]);

  return (
    <>
      <div className="border-b border-line px-5 pb-4 pt-5">
        <p className={`hud flex items-center gap-2 text-mint ${closable ? "min-h-9 pr-12" : ""}`}><HiBeaker className="text-sm" /> Lab · {lab.title}</p>
        <ol className="no-scrollbar -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5" aria-label="Steps">
          {lab.steps.map((s, i) => (
            <li key={s.short}>
              <button
                onClick={() => onStep(i)}
                aria-current={i === frame.step ? "step" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition ${
                  i === frame.step ? "border-mint/60 bg-mint/10 text-star" : "border-line text-dim hover:text-haze"
                }`}
              >
                <span className={`grid h-4 w-4 place-items-center rounded-full font-mono text-[9px] ${i <= frame.step ? "bg-mint text-void" : "bg-white/10"}`}>{i + 1}</span>
                {s.short}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={frame.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h3 className="font-display text-xl font-semibold tracking-tight text-star">{frame.title}</h3>
            {frame.note && <p className="mt-2 text-sm leading-relaxed text-haze">{frame.note}</p>}
            {frame.figures.length > 0 && (
              <div className="mt-4 space-y-5">
                {frame.figures.map((f) => <Figure key={f.src} media={lab.media} figure={f} />)}
              </div>
            )}
            {frame.figures.length === 0 && (
              <a href={lab.repo} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-4 rounded-2xl border border-line bg-white/[0.03] p-4 transition hover:border-mint/40">
                <FaGithub className="shrink-0 text-3xl text-star" />
                <span className="min-w-0">
                  <span className="block font-display text-star">{lab.repo.replace("https://github.com/", "")}</span>
                  <span className="text-sm text-haze">All the code behind this lab</span>
                </span>
              </a>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <a href={step.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-2 text-sm text-haze transition hover:text-mint">
          <FaGithub className="shrink-0" /> <span className="truncate">Run this step</span> <span className="hud shrink-0 !text-[10px]">· {step.githubLabel}</span>
        </a>
        <div className="flex shrink-0 gap-1.5">
          <button onClick={() => onStep(frame.step - 1)} disabled={frame.step === 0} className="holo-btn !h-8 !w-8" aria-label="Previous step"><HiArrowLeft /></button>
          <button onClick={() => onStep(frame.step + 1)} disabled={frame.step === lab.steps.length - 1} className="holo-btn !h-8 !w-8" aria-label="Next step"><HiArrowRight /></button>
        </div>
      </div>
    </>
  );
}

function Figure({ media, figure: f }: { media: string; figure: LabFigure }) {
  return (
    <figure className={f.narrow ? "mx-auto max-w-[15rem]" : ""}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${media}/${f.src}`}
        alt={f.alt}
        className="w-full rounded-2xl border border-line bg-void"
        style={f.pixelated ? { imageRendering: "pixelated" } : undefined}
      />
      {f.caption && <figcaption className="mt-2 text-center text-xs leading-relaxed text-haze">{f.caption}</figcaption>}
    </figure>
  );
}
