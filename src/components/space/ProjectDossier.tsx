"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import Planet from "./Planet";
import { Project, discovered, techList, themeFor } from "./planets";

type Props = {
  open: boolean;
  project: Project | undefined;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (dir: number) => void;
};

export default function ProjectDossier({ open, project, index, total, onClose, onStep }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose, onStep]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && project && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-void/80 backdrop-blur-md" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dossier-title"
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] border border-line bg-deep/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)] sm:rounded-[2rem]"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
          >
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close dossier"
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-line text-haze transition hover:border-mint/50 hover:text-mint"
            >
              <HiX />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={project.id}
                className="grid gap-8 p-6 sm:p-10 md:grid-cols-[260px_1fr]"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center gap-5 md:items-start">
                  <div className="relative grid h-[220px] w-full place-items-center">
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_65%)]" />
                    <Planet
                      theme={themeFor(index)}
                      className="h-40 w-40 animate-float"
                      style={{ "--lx": "32%", "--ly": "30%", "--sx": "78%", "--sy": "80%", "--glow": "0.7" } as React.CSSProperties}
                    />
                  </div>
                  <dl className="w-full space-y-2 font-mono text-[11px]">
                    <Meta k="Designation" v={`Planet ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`} />
                    <Meta k="Class" v={themeFor(index).name} />
                    <Meta k="Discovered" v={discovered(project.createdAt)} />
                  </dl>
                </div>

                <div>
                  <p className="hud text-mint">Mission dossier</p>
                  <h3 id="dossier-title" className="mt-3 pr-10 font-display text-3xl font-semibold leading-tight text-star sm:text-4xl">
                    {project.title}
                  </h3>
                  <p className="mt-5 whitespace-pre-line leading-relaxed text-haze">{project.description}</p>

                  <p className="hud mt-8 mb-3">Payload · tech stack</p>
                  <ul className="flex flex-wrap gap-2">
                    {techList(project.techStack).map((t) => (
                      <li key={t} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[13px] text-star/85">{t}</li>
                    ))}
                  </ul>

                  <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                    {project.link ? (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        <FaGithub /> View source
                      </a>
                    ) : <span />}
                    {total > 1 && (
                      <div className="flex gap-2">
                        <button onClick={() => onStep(-1)} className="btn-ghost !px-4 !py-2">← Prev world</button>
                        <button onClick={() => onStep(1)} className="btn-ghost !px-4 !py-2">Next world →</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <dt className="uppercase tracking-[0.18em] text-dim">{k}</dt>
      <dd className="text-right text-star">{v}</dd>
    </div>
  );
}
