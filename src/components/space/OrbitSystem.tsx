"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { AdminEdit, Reveal, SectionHeading } from "./shared";
import ProjectDossier from "./ProjectDossier";
import Planet from "./Planet";
import { Project, discovered, shortName, techList, themeFor } from "./planets";

const TAU = Math.PI * 2;
const FRONT = Math.PI / 2; // angle on an orbit closest to the viewer (y grows downward)

type Geometry = {
  w: number;
  h: number;
  mobile: boolean;
  anchorY: number; // where the focused planet parks
  focusSize: number;
  lift: number; // star-to-focused-planet distance; the focused world rises out of its orbit toward the viewer
  orbits: { rx: number; ry: number; size: number; omega: number }[];
};

type Tween = { start: number; dur: number; from: number; to: number; fFrom: number; fTo: number };
type Body = { angle: number; focus: number; hover: number; tween: Tween | null };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smoothstep = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const mod = (a: number, n: number) => ((a % n) + n) % n;

function computeGeometry(w: number, n: number): Geometry {
  const mobile = w < 760;
  const h = mobile ? 440 : 720;
  const rMax = mobile ? w * 0.46 : Math.min(w * 0.42, 520);
  const rMin = n <= 1 ? rMax : rMax * (mobile ? 0.42 : 0.34);
  const tilt = mobile ? 0.4 : 0.3;
  const orbits = Array.from({ length: n }, (_, i) => {
    const rx = n <= 1 ? rMax : rMin + ((rMax - rMin) * i) / (n - 1);
    const size = (mobile ? 30 : 46) + ((i * 7) % 3) * (mobile ? 5 : 9);
    // inner worlds move faster, loosely Keplerian
    const omega = 0.16 * Math.pow(rMin / rx, 1.5);
    return { rx, ry: rx * tilt, size, omega };
  });
  const focusSize = mobile ? Math.min(170, w * 0.4) : 210;
  const sunSize = mobile ? 64 : 80;
  return { w, h, mobile, anchorY: h * (mobile ? 0.64 : 0.62), focusSize, lift: focusSize / 2 + sunSize / 2 + 18, orbits };
}

export default function OrbitSystem({ projects }: { projects: Project[] }) {
  const n = projects.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sunRef = useRef<HTMLDivElement>(null);
  const orbitGroupRef = useRef<SVGGElement>(null);

  const [geo, setGeo] = useState<Geometry | null>(null);
  const geoRef = useRef<Geometry | null>(null);
  const [focused, setFocused] = useState(0);
  const focusedRef = useRef(0);
  const [dossierOpen, setDossierOpen] = useState(false);

  // golden-angle spread so the unfocused worlds start scattered around their orbits
  const bodies = useRef<Body[]>(
    projects.map((_, i) => ({ angle: i === 0 ? FRONT : FRONT + i * 2.39996, focus: i === 0 ? 1 : 0, hover: 0, tween: null }))
  );
  const hoverIdx = useRef<number | null>(null);
  const touchX = useRef<number | null>(null);
  const reduced = useRef(false);

  useLayoutEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const g = computeGeometry(el.clientWidth, n);
      geoRef.current = g;
      setGeo(g);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  // Animation loop: writes transforms straight to the DOM so React never re-renders per frame
  useEffect(() => {
    if (!n) return;
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const g = geoRef.current;
      if (g) {
        const cx = g.w / 2;
        const cy = g.anchorY - g.lift;

        if (sunRef.current) sunRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
        if (orbitGroupRef.current) orbitGroupRef.current.setAttribute("transform", `translate(${cx} ${cy})`);

        bodies.current.forEach((b, i) => {
          const o = g.orbits[i];
          if (b.tween) {
            const tw = b.tween;
            const p = Math.min(1, (t - tw.start) / tw.dur);
            b.angle = tw.from + (tw.to - tw.from) * easeInOut(p);
            // incoming worlds swell late in the move, outgoing ones shrink early
            const fp = tw.fTo > tw.fFrom ? smoothstep(0.3, 1, p) : smoothstep(0, 0.6, p);
            b.focus = tw.fFrom + (tw.fTo - tw.fFrom) * fp;
            if (p >= 1) {
              b.tween = null;
              b.angle = mod(b.angle, TAU);
            }
          } else if (i !== focusedRef.current && !reduced.current) {
            b.angle = mod(b.angle + o.omega * dt, TAU);
          }
          b.hover += ((hoverIdx.current === i && i !== focusedRef.current ? 1 : 0) - b.hover) * 0.15;

          const x = cx + o.rx * Math.cos(b.angle);
          const y = cy + o.ry * Math.sin(b.angle) + b.focus * Math.max(0, g.lift - o.ry);
          const depth = Math.sin(b.angle); // -1 far side, +1 nearest the viewer
          const near = (depth + 1) / 2;
          const base = o.size * (0.55 + 0.45 * near) * (1 + 0.25 * b.hover);
          const size = base * (1 - b.focus) + g.focusSize * b.focus;
          const scale = size / g.focusSize;

          // light comes from the star: highlight faces it, night side faces away
          let vx = cx - x, vy = cy - y;
          const len = Math.hypot(vx, vy) || 1;
          vx /= len; vy /= len;

          const el = planetRefs.current[i];
          if (el) {
            el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
            el.style.zIndex = String(Math.round(500 + depth * 400 + b.focus * 1000));
            el.style.filter = `brightness(${(0.45 + 0.55 * near) * (1 - b.focus) + b.focus + b.hover * 0.25})`;
            el.style.setProperty("--lx", `${50 + vx * 28}%`);
            el.style.setProperty("--ly", `${50 + vy * 28}%`);
            el.style.setProperty("--sx", `${50 - vx * 45}%`);
            el.style.setProperty("--sy", `${50 - vy * 45}%`);
            el.style.setProperty("--glow", `${0.25 + 0.5 * b.focus + 0.4 * b.hover}`);
          }
          const label = labelRefs.current[i];
          if (label) {
            label.style.transform = `translate3d(${x}px, ${y + size / 2 + 10}px, 0) translateX(-50%)`;
            label.style.opacity = String((1 - b.focus) * (0.25 + 0.65 * near + 0.3 * b.hover));
            label.style.zIndex = String(Math.round(500 + depth * 400) + 1);
          }
        });
      }
      if (visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    if (stageRef.current) io.observe(stageRef.current);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [n]);

  const focus = useCallback(
    (j: number) => {
      const prev = focusedRef.current;
      if (j === prev || !geoRef.current) return;
      const t = performance.now();
      const fast = reduced.current;

      const b = bodies.current[j];
      let delta = mod(FRONT - b.angle, TAU);
      if (delta > Math.PI * 1.35) delta -= TAU; // swing backwards rather than lapping the whole orbit
      const dur = fast ? 300 : 1100 + Math.abs(delta) * 280;
      b.tween = { start: t, dur, from: b.angle, to: b.angle + delta, fFrom: b.focus, fTo: 1 };

      // anything that was (or was becoming) focused drifts off toward the far side
      bodies.current.forEach((o, i) => {
        if (i !== j && (i === prev || o.focus > 0.01)) {
          o.tween = { start: t, dur: fast ? 300 : 1700, from: o.angle, to: o.angle + Math.PI * 0.85, fFrom: o.focus, fTo: 0 };
        }
      });

      focusedRef.current = j;
      setFocused(j);
    },
    []
  );

  const step = useCallback((dir: number) => focus(mod(focusedRef.current + dir, n)), [focus, n]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  };

  const current = projects[focused];

  return (
    <section id="projects" className="relative px-6 py-32">
      <AdminEdit href="/projects/edit" />
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="03" eyebrow="Project system" title={<>Every project <span className="text-aurora">is a world.</span></>}>
          Tap any planet to pull it out of orbit and into focus (or swipe through them). Tap the focused world to open its mission dossier.
        </SectionHeading>

        {n === 0 ? (
          <p className="hud">No worlds charted yet.</p>
        ) : (
          <Reveal>
            <div className="relative">
              {/* Stage */}
              <div
                ref={stageRef}
                onKeyDown={onKeyDown}
                onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (touchX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchX.current;
                  touchX.current = null;
                  if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
                }}
                className="relative isolate w-full select-none overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(ellipse_at_50%_40%,rgba(30,40,110,0.35),transparent_70%)]"
                style={{ height: geo?.h ?? 720 }}
                role="group"
                aria-label="Project solar system. Use the left and right arrow keys to move between planets."
              >
                {geo && (
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                    <g ref={orbitGroupRef}>
                      {geo.orbits.map((o, i) => (
                        <ellipse
                          key={i}
                          rx={o.rx}
                          ry={o.ry}
                          fill="none"
                          stroke={i === focused ? "rgba(110,242,200,0.5)" : "rgba(170,180,255,0.24)"}
                          strokeWidth={i === focused ? 1.4 : 1}
                          strokeDasharray={i === focused ? undefined : "2 6"}
                          style={{ transition: "stroke .6s" }}
                        />
                      ))}
                    </g>
                  </svg>
                )}

                {/* Central star */}
                <div ref={sunRef} className="pointer-events-none absolute left-0 top-0" style={{ zIndex: 500 }} aria-hidden>
                  <div className="relative" style={{ width: geo?.mobile ? 64 : 80, height: geo?.mobile ? 64 : 80 }}>
                    <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,240,200,0.35),rgba(110,242,200,0.12)_40%,transparent_70%)] animate-pulse-dot" />
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_40%_40%,#ffffff,#fff3c4_35%,#ffb84d_75%,#ff8a3d)] shadow-[0_0_60px_20px_rgba(255,190,90,0.35)]" />
                  </div>
                </div>

                {/* Planets */}
                {projects.map((p, i) => {
                  const theme = themeFor(i);
                  const isFocused = i === focused;
                  return (
                    <button
                      key={p.id}
                      ref={(el) => { planetRefs.current[i] = el; }}
                      onClick={() => (isFocused ? setDossierOpen(true) : focus(i))}
                      onMouseEnter={() => (hoverIdx.current = i)}
                      onMouseLeave={() => (hoverIdx.current = null)}
                      onFocus={() => (hoverIdx.current = i)}
                      onBlur={() => (hoverIdx.current = null)}
                      aria-label={isFocused ? `Open details for ${p.title}` : `Bring ${p.title} into focus`}
                      className="absolute left-0 top-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-mint/70"
                      style={{ width: geo?.focusSize ?? 210, height: geo?.focusSize ?? 210, willChange: "transform" }}
                    >
                      <Planet theme={theme} className="h-full w-full" />
                    </button>
                  );
                })}

                {/* Floating labels for unfocused planets */}
                {!geo?.mobile && projects.map((p, i) => (
                  <span
                    key={p.id}
                    ref={(el) => { labelRefs.current[i] = el; }}
                    className="pointer-events-none absolute left-0 top-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-haze"
                    aria-hidden
                  >
                    {shortName(p.title)}
                  </span>
                ))}

                {/* Tap-to-open hint under the focused world */}
                {geo && (
                  <div className="pointer-events-none absolute inset-x-0 z-[2000] flex justify-center" style={{ top: geo.anchorY + geo.focusSize / 2 + 18 }}>
                  <AnimatePresence mode="wait">
                    <motion.button
                      key={current.id}
                      onClick={() => setDossierOpen(true)}
                      className="pointer-events-auto rounded-full border border-mint/30 bg-void/60 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mint backdrop-blur-md transition hover:bg-mint/10"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
                      exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
                    >
                      ◉ Open dossier
                    </motion.button>
                  </AnimatePresence>
                  </div>
                )}

                {/* Desktop HUD: focused project summary */}
                {geo && !geo.mobile && (
                  <div className="absolute bottom-6 left-6 z-[2100] w-[min(340px,30vw)]">
                    <FocusCard project={current} index={focused} total={n} onOpen={() => setDossierOpen(true)} />
                  </div>
                )}

                {/* Desktop HUD: index of worlds */}
                {geo && !geo.mobile && (
                  <ol className="absolute right-6 top-6 z-[2100] w-[min(260px,24vw)] space-y-1">
                    <li className="hud mb-3 !text-[10px]">Charted worlds</li>
                    {projects.map((p, i) => (
                      <li key={p.id}>
                        <button
                          onClick={() => focus(i)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                            i === focused ? "bg-white/[0.06] text-star" : "text-haze hover:bg-white/[0.03] hover:text-star"
                          }`}
                        >
                          <span className="font-mono text-[10px] text-dim">{String(i + 1).padStart(2, "0")}</span>
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: themeFor(i).dot, boxShadow: i === focused ? `0 0 10px ${themeFor(i).dot}` : undefined }} />
                          <span className="truncate">{shortName(p.title)}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}

                {/* prev / next */}
                {n > 1 && !geo?.mobile && (
                  <div className="absolute bottom-6 right-6 z-[2100] flex gap-2">
                    <NavButton label="Previous planet" onClick={() => step(-1)}>←</NavButton>
                    <NavButton label="Next planet" onClick={() => step(1)}>→</NavButton>
                  </div>
                )}
              </div>

              {/* Mobile: summary card + world chips below the stage */}
              {geo?.mobile && (
                <div className="mt-5 space-y-4">
                  <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
                    {projects.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => focus(i)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                          i === focused ? "border-mint/50 text-star" : "border-line text-haze"
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: themeFor(i).dot }} />
                        {shortName(p.title)}
                      </button>
                    ))}
                  </div>
                  <FocusCard project={current} index={focused} total={n} onOpen={() => setDossierOpen(true)} />
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>

      <ProjectDossier
        open={dossierOpen}
        project={current}
        index={focused}
        total={n}
        onClose={() => setDossierOpen(false)}
        onStep={step}
      />
    </section>
  );
}

function FocusCard({ project, index, total, onOpen }: { project: Project; index: number; total: number; onOpen: () => void }) {
  const tech = techList(project.techStack);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={project.id}
        className="glass rounded-3xl bg-void/60 p-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
      >
        <p className="hud !text-[10px]">
          <span className="text-mint">Now orbiting</span> · Planet {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")} · {discovered(project.createdAt)}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-star">{project.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-haze">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tech.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-haze">{t}</span>
          ))}
          {tech.length > 4 && <span className="px-1 py-0.5 text-[11px] text-dim">+{tech.length - 4}</span>}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-1.5 text-xs font-semibold text-void transition hover:shadow-[0_0_24px_rgba(110,242,200,0.5)]">
            Open dossier <HiArrowRight />
          </button>
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-haze transition hover:text-mint">
              <FaGithub className="text-base" /> Source
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-line bg-void/60 text-haze backdrop-blur-md transition hover:border-mint/50 hover:text-mint"
    >
      {children}
    </button>
  );
}
