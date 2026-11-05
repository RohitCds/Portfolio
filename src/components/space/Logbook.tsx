"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MotionValue, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { HiArrowLeft, HiArrowRight, HiOutlinePaperClip } from "react-icons/hi";
import { AdminEdit } from "./shared";
import { LOG_KINDS, LogEntryDTO, LogKind, formatLogDate, logNumber } from "@/lib/logbook";

export type LogListItem = Omit<LogEntryDTO, "body"> & { minutes: number };

const IMG = "/logbook";
// Scene geometry as fractions of the 16:9 star image (see Desktop/Portfolio/astronaut-source/README.md):
// the square astronaut cutout sits at 864px of 7281, and the watch screen centre is at (656, 606) of its 1024px original
const CUT = { left: 864 / 7281, width: 4096 / 7281 };
const WATCH = { x: CUT.left + CUT.width * (656 / 1024), y: 606 / 1024, top: 572 / 1024, half: CUT.width * (88 / 1024) };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Viewport = { w: number; h: number };
type Pt = [number, number];

// Convex hull (monotone chain) as an SVG path
function hullPath(points: Pt[]) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const out: Pt[] = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    return out.slice(0, -1);
  };
  const hull = [...half(pts), ...half([...pts].reverse())];
  return `M${hull.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")} Z`;
}

// Where everything sits once the gadget is projecting
function layout({ w, h }: Viewport) {
  const wide = w / h > 1.1;
  const boxW = Math.max(w, (h * 16) / 9);
  return {
    wide,
    boxW,
    boxH: (boxW * 9) / 16,
    cardW: wide ? Math.min(360, Math.max(260, 0.24 * w)) : Math.min(300, 0.78 * w),
    cardH: wide ? Math.min(400, 0.52 * h) : Math.min(360, 0.42 * h),
    // holograms float in the open space right of the astronaut (above the watch on phones)
    cx: wide ? 0.655 * w : 0.5 * w,
    cy: wide ? 0.42 * h : 0.36 * h,
    // the camera ends with the watch here, zoomed in by s (on phones, above the controls)
    target: wide ? { x: 0.3 * w, y: 0.8 * h, s: 1.25 } : { x: 0.5 * w, y: 0.72 * h, s: 1.1 },
  };
}

// The whole scroll animation as a function of progress p (0 = arrival, 1 = projecting)
function scene(p: number, vp: Viewport) {
  const L = layout(vp);
  const cam = ease(clamp01(p / 0.55));
  const glow = clamp01((p - 0.3) / 0.25);
  const beam = clamp01((p - 0.48) / 0.22);
  const rise = ease(clamp01((p - 0.58) / 0.32));

  // on screens narrower than 16:9, crop mostly from the left so the open space on the right stays for the text
  const start = { x: (vp.w - L.boxW) * (L.wide ? 0.85 : 0.5) + WATCH.x * L.boxW, y: (vp.h - L.boxH) / 2 + WATCH.y * L.boxH };
  const at = (k: number) => ({ x: lerp(start.x, L.target.x, cam * k), y: lerp(start.y, L.target.y, cam * k) });

  // astronaut: zooms toward the watch; stars: same move at a third of the strength, overscanned so edges never show
  const s = lerp(1, L.target.s, cam);
  const watch = at(1);
  const astro = `translate3d(${watch.x - s * WATCH.x * L.boxW}px, ${watch.y - s * WATCH.y * L.boxH}px, 0) scale(${s})`;
  const ss = 1.12 + (L.target.s - 1) * 0.35 * cam;
  const sw = at(0.35);
  const stars = `translate3d(${sw.x - ss * WATCH.x * L.boxW}px, ${sw.y - ss * WATCH.y * L.boxH}px, 0) scale(${ss})`;

  const screenTop = watch.y - s * (WATCH.y - WATCH.top) * L.boxH;
  const half = s * WATCH.half * L.boxW;

  // holograms rise out of the watch to their spot
  const hs = lerp(0.1, 1, rise);
  const hx = lerp(watch.x, L.cx, rise);
  const hy = lerp(screenTop - (L.cardH / 2) * hs, L.cy, rise);
  // light cone: from the watch screen to every corner of the hologram (the card covers the part behind it)
  const cone = (w: number, inset: number) => {
    const hw = (L.cardW / 2) * hs * inset;
    const hh = (L.cardH / 2) * hs * inset;
    return hullPath([
      [watch.x - half * w, screenTop + 3],
      [watch.x + half * w, screenTop + 3],
      [hx - hw, hy - hh],
      [hx + hw, hy - hh],
      [hx + hw, hy + hh],
      [hx - hw, hy + hh],
    ]);
  };
  const beamPath = cone(0.7, 0.96);
  const corePath = cone(0.25, 0.5);

  return {
    astro,
    stars,
    intro: 1 - clamp01(p / 0.22),
    glow,
    glowX: watch.x,
    glowY: (watch.y + screenTop) / 2,
    glowW: half * 3.2,
    beam,
    beamPath,
    corePath,
    rise,
    holo: `translate(-50%, -50%) translate(${hx - L.cx}px, ${hy - L.cy}px) scale(${hs})`,
  };
}

type Scene = ReturnType<typeof scene>;
const usePick = <K extends keyof Scene>(mv: MotionValue<Scene>, key: K) => useTransform(mv, (sc) => sc[key]);

export default function Logbook({ entries }: { entries: LogListItem[] }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [vp, setVp] = useState<Viewport | null>(null);
  const [kind, setKind] = useState<LogKind | "all">("all");
  const [active, setActive] = useState(0);

  const kindsPresent = useMemo(() => new Set(entries.map((e) => e.kind)), [entries]);
  const visible = entries.filter((e) => kind === "all" || e.kind === kind);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const vw = useMotionValue(1440);
  const vh = useMotionValue(900);
  const still = useMotionValue(reduced ? 1 : 0);
  useEffect(() => still.set(reduced ? 1 : 0), [reduced, still]);

  const sc = useTransform([scrollYProgress, vw, vh, still], ([prog, w, h, r]: number[]) =>
    scene(r ? 1 : clamp01(prog / 0.78), { w, h }),
  );
  const astroT = usePick(sc, "astro");
  const starsT = usePick(sc, "stars");
  const introO = usePick(sc, "intro");
  const glowO = usePick(sc, "glow");
  const glowX = usePick(sc, "glowX");
  const glowY = usePick(sc, "glowY");
  const glowW = usePick(sc, "glowW");
  const beamO = usePick(sc, "beam");
  const beamD = usePick(sc, "beamPath");
  const coreD = usePick(sc, "corePath");
  const riseO = usePick(sc, "rise");
  const holoT = usePick(sc, "holo");
  const [live, setLive] = useState(false); // holograms fully out: controls become interactive
  useEffect(() => riseO.on("change", (v) => setLive(v > 0.92)), [riseO]);

  useEffect(() => {
    const measure = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      vw.set(window.innerWidth);
      vh.set(window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [vw, vh]);

  useEffect(() => setActive(0), [kind]);
  const count = Math.max(1, visible.length);
  const go = (i: number) => setActive(Math.max(0, Math.min(count - 1, i)));

  useEffect(() => {
    if (!live) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === "ArrowRight") setActive((a) => Math.min(count - 1, a + 1));
      if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live, count]);

  // sideways trackpad swipes browse the holograms; vertical scrolling stays with the page
  const holoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = holoRef.current;
    if (!el) return;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now < lock || Math.abs(e.deltaX) < 8) return;
      lock = now + 420;
      setActive((a) => Math.max(0, Math.min(count - 1, a + (e.deltaX > 0 ? 1 : -1))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [count, vp]);

  const L = vp ? layout(vp) : null;

  return (
    <section ref={sectionRef} className="relative" style={{ height: reduced ? "100svh" : "260svh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-void">
        <AdminEdit href="/logbook/edit" />
        {vp && L && (
          <>
            {/* deep space, then the astronaut a little closer to us */}
            <motion.img
              src={`${IMG}/stars-1920.webp`}
              srcSet={`${IMG}/stars-1920.webp 1920w, ${IMG}/stars-3840.webp 3840w`}
              sizes={`${Math.round(L.boxW * 1.2)}px`}
              alt=""
              aria-hidden
              className="absolute left-0 top-0 max-w-none select-none"
              style={{ width: L.boxW, height: L.boxH, transform: starsT, transformOrigin: "0 0" }}
              draggable={false}
            />
            <motion.div
              className="pointer-events-none absolute left-0 top-0"
              style={{ width: L.boxW, height: L.boxH, transform: astroT, transformOrigin: "0 0" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${IMG}/astronaut-1440.webp`}
                srcSet={`${IMG}/astronaut-1440.webp 1440w, ${IMG}/astronaut-2560.webp 2560w`}
                sizes={`${Math.round(L.boxW * CUT.width * L.target.s)}px`}
                alt="An astronaut drifting in deep space, checking the holographic gadget on their wrist"
                fetchPriority="high"
                className="absolute top-0 h-full max-w-none select-none"
                style={{ left: `${CUT.left * 100}%`, width: `${CUT.width * 100}%` }}
                draggable={false}
              />
            </motion.div>

            {/* the watch powering up */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute rounded-full mix-blend-screen"
              style={{
                left: glowX,
                top: glowY,
                width: glowW,
                height: glowW,
                x: "-50%",
                y: "-50%",
                opacity: glowO,
                background: "radial-gradient(closest-side, rgba(150,255,235,0.75), rgba(110,242,200,0.35) 40%, rgba(90,169,255,0) 100%)",
              }}
            />

            {/* projection beam */}
            <motion.svg
              aria-hidden
              className="holo-beam pointer-events-none absolute inset-0 mix-blend-screen"
              width={vp.w}
              height={vp.h}
              style={{ opacity: beamO }}
            >
              <defs>
                <linearGradient id="beam-fill" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#96ffeb" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6ef2c8" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <motion.path d={beamD} fill="url(#beam-fill)" style={{ filter: "blur(10px)" }} />
              <motion.path d={coreD} fill="url(#beam-fill)" style={{ filter: "blur(4px)" }} />
            </motion.svg>

            {/* intro (on narrow screens it sits over the suit, so it gets a dark backdrop) */}
            {!L.wide && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[55%] bg-gradient-to-t from-void via-void/85 to-transparent"
                style={{ opacity: introO }}
              />
            )}
            <motion.div
              className={`pointer-events-none absolute z-10 ${
                L.wide ? "left-[64%] top-1/2 w-[30%] -translate-y-1/2" : "inset-x-6 bottom-[7%] text-center"
              }`}
              style={{ opacity: introO }}
            >
              <p className="hud text-mint">04 · Logbook</p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-star sm:text-5xl">
                Notes from <span className="text-aurora">the frontier.</span>
              </h1>
              <p className={`mt-4 text-haze ${L.wide ? "max-w-sm" : "mx-auto max-w-xs"}`}>
                What I&apos;m studying, in the open: deep dives, research-paper notes and the handwritten pages behind them.
              </p>
              <p className="hud mt-8 animate-pulse !text-[10px]">Scroll to power up the gadget ↓</p>
            </motion.div>

            {/* holograms */}
            <motion.div
              ref={holoRef}
              className="absolute z-20"
              style={{ left: L.cx, top: L.cy, width: L.cardW, height: L.cardH, transform: holoT, opacity: riseO, perspective: 1400 }}
            >
              <motion.div
                className="relative h-full w-full touch-pan-y"
                style={{ transformStyle: "preserve-3d" }}
                onPanEnd={(_, info) => {
                  if (info.offset.x < -50) go(active + 1);
                  else if (info.offset.x > 50) go(active - 1);
                }}
              >
                {visible.length === 0 ? (
                  <Hologram offset={0} width={L.cardW}>
                    <ComingSoon />
                  </Hologram>
                ) : (
                  visible.map((e, i) => (
                    <Hologram key={e.id} offset={i - active} width={L.cardW} onSelect={() => go(i)}>
                      <EntryHologram entry={e} active={i === active} />
                    </Hologram>
                  ))
                )}
              </motion.div>
              {/* projector plane */}
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-[115%] -translate-x-1/2 rounded-[100%]"
                style={{ background: "radial-gradient(closest-side, rgba(110,242,200,0.4), rgba(110,242,200,0))" }}
              />
            </motion.div>

            {/* controls */}
            {visible.length > 0 && (
              <motion.div
                className={`absolute z-30 flex flex-col gap-3 ${
                  L.wide ? "bottom-[7%] right-[5%] items-end" : "inset-x-4 bottom-[3%] items-center"
                } ${live ? "" : "pointer-events-none"}`}
                style={{ opacity: riseO }}
              >
                {kindsPresent.size > 1 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Chip active={kind === "all"} onClick={() => setKind("all")}>All</Chip>
                    {(Object.keys(LOG_KINDS) as LogKind[])
                      .filter((k) => kindsPresent.has(k))
                      .map((k) => (
                        <Chip key={k} active={kind === k} onClick={() => setKind(k)} dot={LOG_KINDS[k].color}>
                          {LOG_KINDS[k].label}
                        </Chip>
                      ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous entry" className="holo-btn">
                    <HiArrowLeft />
                  </button>
                  <span className="hud !text-mint" aria-live="polite">
                    {String(active + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
                  </span>
                  <button onClick={() => go(active + 1)} disabled={active >= visible.length - 1} aria-label="Next entry" className="holo-btn">
                    <HiArrowRight />
                  </button>
                </div>
                <p className="hud hidden !text-[10px] sm:block">Swipe, drag or use ← → to browse</p>
              </motion.div>
            )}
          </>
        )}
        {/* soft hand-off to the footer */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void to-transparent" />
      </div>
    </section>
  );
}

// One hologram in the fan: the active one faces you, neighbours tilt away
function Hologram({ offset, width, onSelect, children }: { offset: number; width: number; onSelect?: () => void; children: React.ReactNode }) {
  const d = Math.abs(offset);
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{
        x: offset * width * 0.74,
        rotateY: -offset * 32,
        z: -d * 160,
        scale: d === 0 ? 1 : 0.86,
        opacity: d > 2 ? 0 : 1 - d * 0.38,
      }}
      transition={{ type: "spring", stiffness: 210, damping: 28 }}
      style={{ zIndex: 10 - d, pointerEvents: d > 2 ? "none" : "auto" }}
      onClick={offset !== 0 ? onSelect : undefined}
      aria-hidden={offset !== 0}
    >
      <div className={`holo-card h-full ${offset === 0 ? "holo-flicker" : "cursor-pointer"}`}>{children}</div>
    </motion.div>
  );
}

function EntryHologram({ entry: e, active }: { entry: LogListItem; active: boolean }) {
  const kind = LOG_KINDS[e.kind];
  const body = (
    <div className="flex h-full flex-col p-6">
      <p className="hud flex flex-wrap items-center gap-x-2 gap-y-1 !text-[10px] !text-mint/80">
        <span>{logNumber(e.number)}</span>
        <span className="inline-flex items-center gap-1.5">
          · <span className="h-1.5 w-1.5 rounded-full" style={{ background: kind.color, boxShadow: `0 0 8px ${kind.color}` }} />
          {kind.label}
        </span>
      </p>
      <h3 className="holo-text mt-3 font-display text-xl font-semibold leading-snug sm:text-2xl">{e.title}</h3>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#bdf7e6]/80 sm:line-clamp-5 [@media(max-height:720px)]:line-clamp-2">{e.summary}</p>
      <div className="mt-auto space-y-3 pt-4">
        {e.tags.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {e.tags.slice(0, 4).map((t) => (
              <span key={t} className="font-mono text-[11px] text-mint/60">#{t}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-mint/20 pt-3 font-mono text-[11px] text-mint/70">
          <span className="flex items-center gap-2">
            {formatLogDate(e.publishedAt)} · {e.minutes} min
            {e.attachments.length > 0 && (
              <span className="inline-flex items-center gap-0.5">
                · <HiOutlinePaperClip /> {e.attachments.length}
              </span>
            )}
          </span>
          {active && <span className="inline-flex items-center gap-1 text-mint">Open <HiArrowRight /></span>}
        </div>
      </div>
    </div>
  );
  return active ? (
    <Link href={`/logbook/${e.slug}`} className="block h-full" draggable={false}>
      {body}
    </Link>
  ) : (
    body
  );
}

function ComingSoon() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <p className="hud !text-[10px] !text-mint/80">{logNumber(1)} · in progress</p>
      <h3 className="holo-text mt-4 font-display text-4xl font-semibold">Coming soon.</h3>
      <p className="mt-4 text-sm leading-relaxed text-[#bdf7e6]/80">
        The first entries are being written: deep dives, research-paper notes and handwritten study pages. Check back soon.
      </p>
      <p className="mt-6 font-mono text-[11px] text-mint/60">signal acquired · awaiting transmission</p>
    </div>
  );
}

function Chip({ active, onClick, dot, children }: { active: boolean; onClick: () => void; dot?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur-sm transition ${
        active ? "border-mint/60 bg-mint/15 text-star" : "border-mint/20 bg-void/40 text-haze hover:text-star"
      }`}
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  );
}
