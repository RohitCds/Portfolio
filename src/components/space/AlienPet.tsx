"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/*
 * Blip, the ship's alien pet. Idle loops (bobbing, antennae, rim lights) are CSS; tricks are CSS
 * animations switched on by a `bp-trick-*` class; eye tracking, blinking and the scroll lean run
 * in a requestAnimationFrame loop that writes straight to the SVG.
 */

type Trick = "juggle" | "roll" | "beam" | "wave" | "read";

const TRICKS: Trick[] = ["juggle", "roll", "beam", "wave", "read"];
const TRICK_MS: Record<Trick, number> = { juggle: 3600, roll: 1100, beam: 2400, wave: 1800, read: 4200 };
const TRICK_LINES: Partial<Record<Trick, string>> = {
  wave: "Zorp! Hi, earthling.",
  read: "Reading along with you…",
  beam: "Nom. Stardust.",
  roll: "Wheee!",
};
const CLICK_LINES = [
  "Boop. You found me.",
  "I'm Blip, the ship's pet.",
  "Psst… the Projects page has actual planets.",
  "Juggling planets is harder than it looks.",
  "I've read this bio 4,096 times. Still good.",
  "Zorp! Hi, earthling.",
];

const EYES = [
  { cx: 66, cy: 70 },
  { cx: 94, cy: 70 },
];
const RIM_LIGHTS = Array.from({ length: 7 }, (_, i) => {
  const a = ((25 + (i * 130) / 6) * Math.PI) / 180;
  return { x: 80 + 50 * Math.cos(a), y: 126 + 9 * Math.sin(a), color: i % 2 ? "#a58bff" : "#6ef2c8", delay: i * 0.2 };
});
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

export default function AlienPet({ className = "" }: { className?: string }) {
  const [trick, setTrick] = useState<Trick | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [happy, setHappy] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const leanRef = useRef<HTMLDivElement>(null);
  const eyeRefs = useRef<(SVGGElement | null)[]>([]);
  const pupilRefs = useRef<(SVGGElement | null)[]>([]);
  const trickRef = useRef<Trick | null>(null);
  const lastTrick = useRef<Trick | null>(null);
  const visible = useRef(false);
  const reduced = useRef(false);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const say = useCallback((line: string) => {
    setBubble(line);
    later(() => setBubble((b) => (b === line ? null : b)), 2600);
  }, []);

  const startTrick = useCallback(
    (t: Trick, line?: string) => {
      trickRef.current = t;
      lastTrick.current = t;
      setTrick(t);
      if (line) say(line);
      later(() => {
        trickRef.current = null;
        setTrick(null);
      }, TRICK_MS[t]);
    },
    [say]
  );

  // Trick scheduler: something new every 6–10s while Blip is on screen
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return;
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(() => {
        if (visible.current && !trickRef.current) {
          const t = pick(TRICKS.filter((x) => x !== lastTrick.current));
          const line = TRICK_LINES[t];
          startTrick(t, t === "roll" && Math.random() < 0.5 ? undefined : line);
        }
        schedule();
      }, 6000 + Math.random() * 4000);
    };
    id = window.setTimeout(() => {
      if (visible.current) startTrick("wave", TRICK_LINES.wave); // say hi shortly after arriving
      schedule();
    }, 1600);
    const pending = timers.current;
    return () => {
      clearTimeout(id);
      pending.forEach(clearTimeout);
    };
  }, [startTrick]);

  // Eyes, blinking and scroll lean
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(svg);

    let pointer = { x: 0, y: 0, at: -1e9, touch: false };
    const onPointer = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY, at: performance.now(), touch: e.pointerType === "touch" };
    };
    let lastScroll = window.scrollY;
    let leanTarget = 0;
    let lean = 0;
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      leanTarget = Math.max(-12, Math.min(12, -dy * 0.35));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const pupils = EYES.map(() => ({ x: 0, y: 0 }));
    let nextBlink = performance.now() + 1800;
    let blinkStart = -1;
    let raf = 0;

    const frame = (t: number) => {
      const rect = svg.getBoundingClientRect();
      const scale = rect.width / 160;
      const following = !pointer.touch && t - pointer.at < 2500 && trickRef.current !== "read";

      EYES.forEach((eye, i) => {
        let tx: number, ty: number;
        if (following) {
          const dx = pointer.x - (rect.left + eye.cx * scale);
          const dy = pointer.y - (rect.top + eye.cy * scale);
          const d = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, d / 160) * 4.2;
          tx = (dx / d) * k;
          ty = (dy / d) * k;
        } else {
          // "reading": sweep along a line toward the bio, snap back, drop a line
          const period = trickRef.current === "read" ? 900 : 1500;
          const phase = (t / period) % 1;
          const line = Math.floor(t / period) % 4;
          tx = -1.5 + 5 * phase;
          ty = -1.5 + line * 1.3;
        }
        pupils[i].x += (tx - pupils[i].x) * 0.2;
        pupils[i].y += (ty - pupils[i].y) * 0.2;
        pupilRefs.current[i]?.setAttribute("transform", `translate(${eye.cx + pupils[i].x} ${eye.cy + pupils[i].y})`);
      });

      if (t >= nextBlink) {
        blinkStart = t;
        nextBlink = t + (Math.random() < 0.25 ? 260 : 2500 + Math.random() * 3000); // sometimes a double blink
      }
      const bt = t - blinkStart;
      const lid = bt >= 0 && bt < 150 ? 1 - 0.92 * Math.sin((Math.PI * bt) / 150) : 1;
      EYES.forEach((eye, i) =>
        eyeRefs.current[i]?.setAttribute("transform", `translate(${eye.cx} ${eye.cy}) scale(1 ${lid}) translate(${-eye.cx} ${-eye.cy})`)
      );

      if (!reduced.current && leanRef.current) {
        leanTarget *= 0.9;
        lean += (leanTarget - lean) * 0.12;
        leanRef.current.style.transform = `rotate(${lean.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onClick = () => {
    if (trickRef.current || reduced.current) return say(pick(CLICK_LINES));
    startTrick(pick(TRICKS.filter((x) => x !== lastTrick.current)), pick(CLICK_LINES));
  };

  return (
    <div className={className}>
      <div className="relative">
        <AnimatePresence>
          {bubble && (
            <motion.div
              key={bubble}
              role="status"
              className="glass pointer-events-none absolute top-2 z-10 rounded-2xl max-lg:w-44 lg:whitespace-nowrap bg-deep/80 px-3 py-2 font-display text-sm text-star shadow-[0_10px_30px_rgba(0,0,0,0.4)] max-lg:right-full max-lg:mr-1 max-lg:rounded-br-sm lg:left-full lg:ml-1 lg:rounded-bl-sm"
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {bubble}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={leanRef} style={{ transformOrigin: "50% 85%" }}>
          <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHappy(true)}
            onMouseLeave={() => setHappy(false)}
            onFocus={() => setHappy(true)}
            onBlur={() => setHappy(false)}
            aria-label="Blip, the ship's alien pet. Click for a trick."
            className="block w-[128px] cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-mint/60"
          >
            <svg ref={svgRef} viewBox="0 0 160 170" className={`bp-bob block overflow-visible ${trick ? `bp-trick-${trick}` : ""}`} aria-hidden>
              <BlipDefs />

              {/* tractor beam + glow below the saucer */}
              <polygon className="bp-beam" points="64,138 96,138 130,212 30,212" fill="url(#bp-beam)" />
              <path className="bp-star" d="M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z" fill="#fff6c9" filter="url(#bp-glowf)" />
              <ellipse className="bp-glow" cx="80" cy="160" rx="30" ry="4" fill="#6ef2c8" filter="url(#bp-blur)" />

              <g className="bp-body">
                <g style={{ transform: happy ? "scale(1.05, 0.95)" : "none", transformOrigin: "80px 118px", transition: "transform .2s" }}>
                  {/* antennae (behind the head) */}
                  <g className="bp-antenna-l">
                    <path d="M68,40 Q60,26 55,15" stroke="#2c9b80" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <circle cx="55" cy="13" r="5" fill="#a58bff" filter="url(#bp-glowf)" />
                  </g>
                  <g className="bp-antenna-r">
                    <path d="M92,40 Q100,26 105,15" stroke="#2c9b80" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <circle cx="105" cy="13" r="5" fill="#6ef2c8" filter="url(#bp-glowf)" />
                  </g>

                  {/* head */}
                  <path d="M80,30 C104,30 116,50 116,72 C116,96 100,114 80,114 C60,114 44,96 44,72 C44,50 56,30 80,30 Z" fill="url(#bp-skin)" />
                  <circle cx="91" cy="43" r="4" fill="#2c9b80" opacity="0.35" />
                  <circle cx="101" cy="52" r="2.5" fill="#2c9b80" opacity="0.35" />
                  <circle cx="63" cy="45" r="2.5" fill="#2c9b80" opacity="0.35" />
                  <ellipse cx="58" cy="88" rx="5.5" ry="3" fill="#ff8fb1" opacity={happy ? 0.8 : 0.4} style={{ transition: "opacity .2s" }} />
                  <ellipse cx="102" cy="88" rx="5.5" ry="3" fill="#ff8fb1" opacity={happy ? 0.8 : 0.4} style={{ transition: "opacity .2s" }} />

                  {/* eyes: open (tracked) or happy ^^ */}
                  <g opacity={happy ? 0 : 1}>
                    {EYES.map((eye, i) => (
                      <g key={i} ref={(el) => { eyeRefs.current[i] = el; }}>
                        <ellipse cx={eye.cx} cy={eye.cy} rx="11" ry="12" fill="#fff" />
                        <g ref={(el) => { pupilRefs.current[i] = el; }} transform={`translate(${eye.cx} ${eye.cy})`}>
                          <circle r="6" fill="#0a0d1f" />
                          <circle cx="-2" cy="-2.5" r="2" fill="#fff" />
                        </g>
                      </g>
                    ))}
                  </g>
                  {happy && (
                    <g stroke="#0a3d33" strokeWidth="3.2" strokeLinecap="round" fill="none">
                      <path d="M57,73 Q66,62 75,73" />
                      <path d="M85,73 Q94,62 103,73" />
                    </g>
                  )}

                  {/* reading glasses (trick) */}
                  <g className="bp-glasses" stroke="#c9d2ee" strokeWidth="2" fill="rgba(90,169,255,0.12)">
                    <circle cx="66" cy="70" r="13" />
                    <circle cx="94" cy="70" r="13" />
                    <path d="M79,69 Q80,66 81,69" fill="none" />
                  </g>

                  {/* mouth: smile, open when happy, chomps during the beam trick */}
                  {happy ? (
                    <g>
                      <path d="M71,91 Q80,105 89,91 Z" fill="#0a3d33" />
                      <ellipse cx="80" cy="98" rx="3.5" ry="2" fill="#ff8fb1" />
                    </g>
                  ) : (
                    <path d="M73,93 Q80,99 87,93" stroke="#0a3d33" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  )}
                  <path className="bp-chomp" d="M71,91 Q80,105 89,91 Z" fill="#0a3d33" />

                  {/* saucer */}
                  <ellipse cx="80" cy="124" rx="54" ry="13" fill="url(#bp-hull)" />
                  <ellipse cx="80" cy="120" rx="44" ry="6" fill="rgba(255,255,255,0.14)" />
                  <path d="M49,113 A31,7 0 0 0 111,113" stroke="#c9d2ee" strokeWidth="3" fill="none" />
                  {RIM_LIGHTS.map((l, i) => (
                    <circle key={i} className="bp-light" cx={l.x} cy={l.y} r="2.4" fill={l.color} style={{ animationDelay: `${l.delay}s` }} />
                  ))}
                  <ellipse cx="80" cy="136" rx="16" ry="4" fill="#2a2f55" />
                  <ellipse cx="80" cy="137" rx="10" ry="2.5" fill="#6ef2c8" opacity="0.85" />

                  {/* arms resting on the rim */}
                  <g className="bp-arm-l">
                    <path d="M50,96 Q40,102 40,111" stroke="#23987a" strokeWidth="7" strokeLinecap="round" fill="none" />
                    <circle cx="40" cy="112" r="4.5" fill="#23987a" stroke="#176b56" strokeWidth="1" />
                  </g>
                  <g className="bp-arm-r">
                    <path d="M110,96 Q120,102 120,111" stroke="#23987a" strokeWidth="7" strokeLinecap="round" fill="none" />
                    <circle cx="120" cy="112" r="4.5" fill="#23987a" stroke="#176b56" strokeWidth="1" />
                  </g>

                  {/* juggling planets (trick) */}
                  <circle className="bp-ball" r="5.5" filter="url(#bp-glowf)" fill="#f4b26a" />
                  <circle className="bp-ball" r="5.5" filter="url(#bp-glowf)" fill="#a58bff" style={{ animationDelay: "-0.4s" }} />
                  <circle className="bp-ball" r="5.5" filter="url(#bp-glowf)" fill="#5aa9ff" style={{ animationDelay: "-0.8s" }} />
                </g>
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function BlipDefs() {
  return (
    <defs>
      <radialGradient id="bp-skin" cx="40%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#e2fff6" />
        <stop offset="45%" stopColor="#7af5cf" />
        <stop offset="100%" stopColor="#2c9b80" />
      </radialGradient>
      <linearGradient id="bp-hull" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e3e8f8" />
        <stop offset="55%" stopColor="#7d86ad" />
        <stop offset="100%" stopColor="#3a4068" />
      </linearGradient>
      <linearGradient id="bp-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6ef2c8" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#6ef2c8" stopOpacity="0" />
      </linearGradient>
      <filter id="bp-blur" x="-50%" y="-200%" width="200%" height="500%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <filter id="bp-glowf" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}
