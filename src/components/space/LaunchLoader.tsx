"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/*
 * Loading screen: a mini rocket hops between planets, climbing upward and alternating sides.
 * World coordinates: planet i sits on the left (even i) or right (odd i), each one STEP higher
 * than the last. After every landing the camera pans down one STEP, so the planet the rocket
 * just reached settles to the lower slot and the next one drops in from the top.
 */

const LEFT = 150;
const RIGHT = 450;
const LOW = 340; // screen y of the planet the rocket departs from
const STEP = 165; // vertical gap between consecutive planets
const PR = 42; // planet radius
const BASE = 15; // rocket centre sits this far above the surface
const PARTICLES = 48;

const DUR = { idle: 450, flight: 1500, land: 300, pan: 850 };

type PlanetDef = { name: string; art: ReactNode };

const planetPos = (i: number) => ({ x: i % 2 === 0 ? LEFT : RIGHT, y: LOW - i * STEP });
const padPos = (i: number) => {
  const p = planetPos(i);
  return { x: p.x, y: p.y - PR - BASE };
};

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
const smoothstep = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

const STATUS = [
  "Plotting trajectory",
  "Fuelling thrusters",
  "Calibrating star charts",
  "Requesting landing clearance",
  "Dodging space debris",
  "Pinging mission control",
];

const LAST_START_KEY = "launch-loader:last-start";

// Fisher–Yates shuffle of the worlds, never starting on the same one as the previous load
function shuffledOrder() {
  const order = PLANETS.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  let lastStart = -1;
  try {
    lastStart = Number(localStorage.getItem(LAST_START_KEY) ?? -1);
  } catch {}
  if (order[0] === lastStart) {
    const j = 1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[j]] = [order[j], order[0]];
  }
  try {
    localStorage.setItem(LAST_START_KEY, String(order[0]));
  } catch {}
  return order;
}

export default function LaunchLoader() {
  const pathname = usePathname();
  const destination = pathname === "/" ? "home" : pathname.split("/").filter(Boolean)[0];

  const [hop, setHop] = useState(0);
  const [status, setStatus] = useState(0);
  // order in which the worlds appear; shuffled after mount (not during render, to keep SSR hydration stable).
  // The loader starts hidden for 150ms, so the swap from the default order is never seen.
  const [order, setOrder] = useState(() => PLANETS.map((_, i) => i));

  const worldRef = useRef<SVGGElement>(null);
  const rocketRef = useRef<SVGGElement>(null);
  const flameOuterRef = useRef<SVGPathElement>(null);
  const flameInnerRef = useRef<SVGPathElement>(null);
  const planPathRef = useRef<SVGPathElement>(null);
  const planetEls = useRef(new Map<number, SVGGElement>());
  const particleEls = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    setOrder(shuffledOrder());
    setStatus(Math.floor(Math.random() * STATUS.length));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setStatus((s) => (s + 1) % STATUS.length), 1700);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function showFlightPlan(i: number) {
      const a = padPos(i), b = padPos(i + 1);
      planPathRef.current?.setAttribute("d", `M${a.x},${a.y} C${a.x},${a.y - 130} ${b.x},${b.y - 110} ${b.x},${b.y}`);
      planPathRef.current?.setAttribute("opacity", "1");
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // static scene: rocket waiting on the first planet, flight plan drawn to the next
      placeRocket(padPos(0).x, padPos(0).y, 0, 1);
      planetEls.current.forEach((el, i) => el.setAttribute("opacity", i <= 1 ? "1" : "0"));
      showFlightPlan(0);
      return;
    }

    let raf = 0;
    let hopIdx = 0;
    let phase: keyof typeof DUR = "idle";
    let phaseStart = performance.now() - DUR.idle * 0.4; // first launch comes a little sooner
    let last = performance.now();
    let particleCursor = 0;
    const particles = Array.from({ length: PARTICLES }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, r: 1, hot: true }));

    const emit = (x: number, y: number, vx: number, vy: number, max: number, r: number, hot: boolean) => {
      const p = particles[particleCursor];
      particleCursor = (particleCursor + 1) % PARTICLES;
      Object.assign(p, { x, y, vx, vy, life: 1, max, r, hot });
    };

    showFlightPlan(0);

    function placeRocket(x: number, y: number, angle: number, squash: number) {
      rocketRef.current?.setAttribute("transform", `translate(${x} ${y}) rotate(${angle}) scale(1 ${squash})`);
    }

    function setFlame(power: number) {
      const len = power * (13 + Math.random() * 6);
      flameOuterRef.current?.setAttribute("d", power ? `M-4.5,14 Q0,${14 + len} 4.5,14 Z` : "");
      flameInnerRef.current?.setAttribute("d", power ? `M-2.3,14 Q0,${14 + len * 0.55} 2.3,14 Z` : "");
    }

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const elapsed = t - phaseStart;
      let cam = hopIdx * STEP;
      let incomingBounce = 0;

      if (phase === "idle") {
        const pad = padPos(hopIdx);
        placeRocket(pad.x, pad.y, 0, 1);
        setFlame(elapsed > DUR.idle - 120 ? 0.5 : 0); // ignition just before lift-off
        if (elapsed >= DUR.idle) { phase = "flight"; phaseStart = t; }
      } else if (phase === "flight") {
        const p = Math.min(1, elapsed / DUR.flight);
        const s = easeInOutSine(p);
        const a = padPos(hopIdx), b = padPos(hopIdx + 1);
        const P = [a, { x: a.x, y: a.y - 130 }, { x: b.x, y: b.y - 110 }, b];
        const u = 1 - s;
        const x = u * u * u * P[0].x + 3 * u * u * s * P[1].x + 3 * u * s * s * P[2].x + s * s * s * P[3].x;
        const y = u * u * u * P[0].y + 3 * u * u * s * P[1].y + 3 * u * s * s * P[2].y + s * s * s * P[3].y;
        const dx = 3 * u * u * (P[1].x - P[0].x) + 6 * u * s * (P[2].x - P[1].x) + 3 * s * s * (P[3].x - P[2].x);
        const dy = 3 * u * u * (P[1].y - P[0].y) + 6 * u * s * (P[2].y - P[1].y) + 3 * s * s * (P[3].y - P[2].y);
        const len = Math.hypot(dx, dy) || 1;

        // nose follows the path, then the rocket flips upright to land tail-first
        const heading = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        const flip = smoothstep(0.6, 0.88, p);
        const diff = ((0 - heading + 540) % 360) - 180;
        const angle = heading + diff * flip;

        // a gentle wobble so the flight never looks ruler-straight
        const wobble = Math.sin(p * Math.PI * 4) * 2.5 * Math.sin(p * Math.PI);
        const rx = x + (-dy / len) * wobble;
        const ry = y + (dx / len) * wobble;
        placeRocket(rx, ry, angle, 1);

        const power = p < 0.2 ? 1 : p > 0.7 ? 0.95 : 0.6;
        setFlame(power);

        // exhaust leaves the nozzle opposite to where the rocket is pointing
        const rad = (angle * Math.PI) / 180;
        const tx = rx - Math.sin(rad) * 16, ty = ry + Math.cos(rad) * 16;
        emit(tx, ty, -Math.sin(rad) * 40 + (Math.random() - 0.5) * 20, Math.cos(rad) * 40 + (Math.random() - 0.5) * 20, 0.7, 1.6, true);

        if (p >= 1) {
          phase = "land";
          phaseStart = t;
          planPathRef.current?.setAttribute("opacity", "0");
          const pad = padPos(hopIdx + 1);
          for (let k = 0; k < 10; k++) {
            const dir = k % 2 ? 1 : -1;
            emit(pad.x + dir * 4, pad.y + BASE, dir * (25 + Math.random() * 45), -6 - Math.random() * 14, 0.9, 1.4, false);
          }
        }
      } else if (phase === "land") {
        const p = Math.min(1, elapsed / DUR.land);
        const pad = padPos(hopIdx + 1);
        placeRocket(pad.x, pad.y + 2 * Math.sin(p * Math.PI), 0, 1 - 0.1 * Math.sin(p * Math.PI));
        setFlame((1 - p) * 0.5);
        if (p >= 1) { phase = "pan"; phaseStart = t; }
      } else {
        const p = Math.min(1, elapsed / DUR.pan);
        const e = easeInOutCubic(p);
        cam = (hopIdx + e) * STEP;
        incomingBounce = (easeOutBack(p) - e) * STEP; // the new planet overshoots slightly as it drops in
        const pad = padPos(hopIdx + 1);
        placeRocket(pad.x, pad.y, 0, 1);
        setFlame(0);
        if (p >= 1) {
          hopIdx += 1;
          cam = hopIdx * STEP;
          incomingBounce = 0;
          setHop(hopIdx);
          showFlightPlan(hopIdx);
          phase = "idle";
          phaseStart = t;
        }
      }

      worldRef.current?.setAttribute("transform", `translate(0 ${cam})`);

      // planets fade in near the top and out near the bottom of the window
      planetEls.current.forEach((el, i) => {
        const base = planetPos(i);
        const extra = phase === "pan" && i === hopIdx + 2 ? incomingBounce : 0;
        const screenY = base.y + extra + cam;
        const fadeIn = smoothstep(LOW - 2 * STEP + 20, LOW - STEP - 10, screenY);
        const fadeOut = 1 - smoothstep(LOW + 10, LOW + STEP * 0.7, screenY);
        el.setAttribute("transform", `translate(${base.x} ${base.y + extra})`);
        el.setAttribute("opacity", String(Math.min(fadeIn, fadeOut)));
      });

      particles.forEach((p, k) => {
        const el = particleEls.current[k];
        if (!el) return;
        if (p.life <= 0) { el.setAttribute("opacity", "0"); return; }
        p.life -= dt / p.max;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        el.setAttribute("cx", String(p.x));
        el.setAttribute("cy", String(p.y));
        el.setAttribute("r", String(p.r + (1 - p.life) * 3.2));
        el.setAttribute("fill", p.hot && p.life > 0.55 ? "#ffcf7a" : "#9aa3c7");
        el.setAttribute("opacity", String(Math.max(0, p.life) * 0.75));
      });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const visible: number[] = [];
  for (let i = Math.max(0, hop - 1); i <= hop + 2; i++) visible.push(i);
  const planetAt = (i: number) => PLANETS[order[i % order.length]];
  const from = planetAt(hop).name;
  const to = planetAt(hop + 1).name;

  return (
    <div className="loader-fade fixed inset-0 z-40 flex flex-col items-center justify-center bg-void/50 px-4 backdrop-blur-[2px]" role="status" aria-live="polite">
      <span className="sr-only">Loading {destination}</span>

      <svg viewBox="0 0 600 460" className="h-auto w-[min(560px,92vw)] overflow-hidden" aria-hidden>
        <Defs />
        <g ref={worldRef}>
          <path ref={planPathRef} fill="none" stroke="#6ef2c8" strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="3 6" style={{ transition: "opacity .3s" }} />

          {visible.map((i) => {
            const def = planetAt(i);
            const { x, y } = planetPos(i);
            return (
              <g
                key={i}
                ref={(el) => { if (el) planetEls.current.set(i, el); else planetEls.current.delete(i); }}
                transform={`translate(${x} ${y})`}
                opacity={0}
              >
                {def.art}
                <ellipse cy={-PR + 1} rx="9" ry="2.4" fill="#6ef2c8" opacity="0.65" className={i === hop + 1 ? "ll-blink" : undefined} />
                <text y={PR + 26} textAnchor="middle" fontSize="9" letterSpacing="2.5" fill="#8f97ba" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {def.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {Array.from({ length: PARTICLES }, (_, k) => (
            <circle key={k} ref={(el) => { particleEls.current[k] = el; }} r="0" opacity="0" />
          ))}

          <g ref={rocketRef}>
            <Rocket flameOuterRef={flameOuterRef} flameInnerRef={flameInnerRef} />
          </g>
        </g>
      </svg>

      <div className="mt-2 text-center">
        <p className="hud text-mint">En route to /{destination}</p>
        <p className="mt-2 font-display text-xl text-star">
          {STATUS[status]}
          <span className="animate-pulse">…</span>
        </p>
        <p className="hud mt-2 !text-[10px] !text-dim">
          Hop {String(hop + 1).padStart(2, "0")} · {from} → {to}
        </p>
      </div>
    </div>
  );
}

function Rocket({ flameOuterRef, flameInnerRef }: { flameOuterRef: React.Ref<SVGPathElement>; flameInnerRef: React.Ref<SVGPathElement> }) {
  return (
    <g>
      <path ref={flameOuterRef} fill="url(#ll-flame)" />
      <path ref={flameInnerRef} fill="#fff6d6" />
      <path d="M-7,5 L-12.5,15 L-7,12 Z" fill="#6ef2c8" />
      <path d="M7,5 L12.5,15 L7,12 Z" fill="#4fd6ad" />
      <path d="M0,-18 C6,-12 7,-4 7,6 L7,12 L-7,12 L-7,6 C-7,-4 -6,-12 0,-18 Z" fill="#e9ecf8" />
      <path d="M2,-16 C6,-11 7,-4 7,6 L7,12 L3,12 Z" fill="rgba(10,13,31,0.18)" />
      <path d="M0,-18 C3,-15 4.6,-11 5.4,-8 L-5.4,-8 C-4.6,-11 -3,-15 0,-18 Z" fill="#7b7ff6" />
      <circle cy="-1" r="3" fill="#5aa9ff" stroke="#0a0d1f" strokeWidth="1.2" />
      <rect x="-7" y="7" width="14" height="2" fill="#6ef2c8" opacity="0.8" />
      <rect x="-4" y="12" width="8" height="2.5" rx="1" fill="#8f97ba" />
    </g>
  );
}

function Defs() {
  const planet = (id: string, light: string, mid: string, dark: string) => (
    <radialGradient id={id} cx="35%" cy="30%" r="80%">
      <stop offset="0%" stopColor={light} />
      <stop offset="45%" stopColor={mid} />
      <stop offset="100%" stopColor={dark} />
    </radialGradient>
  );
  return (
    <defs>
      {planet("ll-terra", "#a8dcff", "#2f6fd6", "#0f2a66")}
      {planet("ll-luna", "#f1f2f7", "#9aa0b5", "#3f4458")}
      {planet("ll-rust", "#ffbe9a", "#d6593b", "#4f160d")}
      {planet("ll-ring", "#fff0c8", "#e0a050", "#5e330f")}
      {planet("ll-ice", "#e8fffa", "#6ef2c8", "#145a50")}
      {planet("ll-ember", "#7a3a30", "#3a1616", "#140507")}
      <radialGradient id="ll-shade" cx="30%" cy="25%" r="85%">
        <stop offset="55%" stopColor="#02030a" stopOpacity="0" />
        <stop offset="100%" stopColor="#02030a" stopOpacity="0.7" />
      </radialGradient>
      <linearGradient id="ll-flame" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd36b" />
        <stop offset="100%" stopColor="#ff5a3d" stopOpacity="0" />
      </linearGradient>
      <clipPath id="ll-clip"><circle r={PR} /></clipPath>
      <clipPath id="ll-clip-ice"><polygon points={ICE_SHAPE} /></clipPath>
      <filter id="ll-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.6" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

const ICE_SHAPE = "-12,-42 12,-42 26,-34 38,-18 43,2 36,20 24,36 4,43 -16,40 -32,30 -42,10 -40,-12 -28,-32";

// Fixed rotation of worlds the rocket hops between
const PLANETS: PlanetDef[] = [
  {
    name: "Terra",
    art: (
      <>
        <circle r={PR + 5} fill="none" stroke="rgba(124,196,255,0.2)" strokeWidth="6" />
        <circle r={PR} fill="url(#ll-terra)" />
        <g clipPath="url(#ll-clip)">
          <path d="M-30,-18 C-18,-30 -2,-22 -6,-8 C-10,4 -26,6 -36,-4 Z" fill="#5fd38d" />
          <path d="M8,6 C20,-4 38,4 32,18 C28,30 12,30 6,20 Z" fill="#4cc27c" />
          <path d="M-12,22 C-4,18 4,26 -2,34 C-8,38 -16,32 -12,22 Z" fill="#5fd38d" />
          <ellipse cx="-6" cy="-31" rx="18" ry="3" fill="#fff" opacity="0.55" />
          <ellipse cx="16" cy="-8" rx="14" ry="2.5" fill="#fff" opacity="0.45" />
          <ellipse cx="-14" cy="12" rx="16" ry="2.5" fill="#fff" opacity="0.4" />
        </g>
        <circle r={PR} fill="url(#ll-shade)" />
        {/* launch tower */}
        <g transform="translate(-14 -39.5) rotate(-19)">
          <rect x="-1.2" y="-18" width="2.4" height="18" fill="#c9d2ee" />
          <line x1="0" y1="-13" x2="7" y2="-13" stroke="#c9d2ee" strokeWidth="1.2" />
          <line x1="0" y1="-7" x2="5" y2="-7" stroke="#c9d2ee" strokeWidth="1.2" />
          <circle cy="-19.5" r="1.5" fill="#ff6b6b" className="ll-blink" />
        </g>
      </>
    ),
  },
  {
    name: "Luna",
    art: (
      <>
        <circle r={PR} fill="url(#ll-luna)" />
        <g clipPath="url(#ll-clip)">
          {[[-14, -8, 9], [12, 10, 7], [-4, 24, 5], [21, -17, 4], [-26, 14, 4.5], [28, 24, 3]].map(([cx, cy, r]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill="rgba(60,64,82,0.45)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
          ))}
        </g>
        <circle r={PR} fill="url(#ll-shade)" />
        {/* flag */}
        <line x1="16" y1="-39" x2="16" y2="-56" stroke="#c9d2ee" strokeWidth="1.2" />
        <path d="M16,-56 L27,-53.5 L16,-50.5 Z" fill="#6ef2c8" />
      </>
    ),
  },
  {
    name: "Rust",
    art: (
      <>
        <circle r={PR} fill="url(#ll-rust)" />
        <g clipPath="url(#ll-clip)">
          <ellipse cx="-12" cy="6" rx="16" ry="7" fill="rgba(80,18,8,0.35)" />
          <ellipse cx="16" cy="20" rx="12" ry="5" fill="rgba(80,18,8,0.3)" />
          <ellipse cx="10" cy="-12" rx="9" ry="4" fill="rgba(80,18,8,0.25)" />
          <ellipse cy="-40" rx="20" ry="7" fill="#fff2ec" opacity="0.9" />
        </g>
        <circle r={PR} fill="url(#ll-shade)" />
        {/* habitat dome and antenna */}
        <g transform="translate(-23 -35) rotate(-33)">
          <path d="M-7,0 A7,7 0 0 1 7,0 Z" fill="rgba(180,240,255,0.35)" stroke="#bfefff" strokeWidth="1" />
          <rect x="-8" y="-0.5" width="16" height="1.5" fill="#c9d2ee" />
        </g>
        <g transform="translate(24 -34.5) rotate(35)">
          <line x1="0" y1="0" x2="0" y2="-13" stroke="#c9d2ee" strokeWidth="1.2" />
          <path d="M-4,-12 Q0,-16 4,-12" fill="none" stroke="#c9d2ee" strokeWidth="1.2" />
          <circle cy="-14.5" r="1.4" fill="#6ef2c8" className="ll-blink" />
        </g>
      </>
    ),
  },
  {
    name: "Ringworld",
    art: (
      <>
        <g transform="rotate(-14)">
          <path d="M-72,0 A72,15 0 0 1 72,0" fill="none" stroke="rgba(255,225,170,0.5)" strokeWidth="4" />
          <path d="M-62,0 A62,11 0 0 1 62,0" fill="none" stroke="rgba(255,225,170,0.25)" strokeWidth="2" />
        </g>
        <circle r={PR} fill="url(#ll-ring)" />
        <g clipPath="url(#ll-clip)">
          <rect x="-50" y="-22" width="100" height="6" fill="rgba(110,55,15,0.3)" />
          <rect x="-50" y="-8" width="100" height="4" fill="rgba(255,240,200,0.25)" />
          <rect x="-50" y="6" width="100" height="8" fill="rgba(110,55,15,0.32)" />
          <rect x="-50" y="22" width="100" height="4" fill="rgba(255,240,200,0.2)" />
        </g>
        <circle r={PR} fill="url(#ll-shade)" />
        <g transform="rotate(-14)">
          <path d="M-72,0 A72,15 0 0 0 72,0" fill="none" stroke="rgba(255,225,170,0.75)" strokeWidth="4" />
          <path d="M-62,0 A62,11 0 0 0 62,0" fill="none" stroke="rgba(255,225,170,0.35)" strokeWidth="2" />
        </g>
      </>
    ),
  },
  {
    name: "Glacier",
    art: (
      <>
        <polygon points="-38,-14 -54,-26 -41,-5" fill="#e6fffa" stroke="#6ef2c8" strokeWidth="0.8" />
        <polygon points="38,18 54,26 35,25" fill="#e6fffa" stroke="#6ef2c8" strokeWidth="0.8" />
        <polygon points="20,38 26,55 13,41" fill="#e6fffa" stroke="#6ef2c8" strokeWidth="0.8" />
        <polygon points={ICE_SHAPE} fill="url(#ll-ice)" />
        <g clipPath="url(#ll-clip-ice)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none">
          <path d="M-12,-42 L-6,-10 L-40,-12" />
          <path d="M-6,-10 L22,4 L38,-18" />
          <path d="M22,4 L4,43" />
          <path d="M-6,-10 L-20,24" />
          <circle r={PR + 4} fill="url(#ll-shade)" stroke="none" />
        </g>
      </>
    ),
  },
  {
    name: "Ember",
    art: (
      <>
        <circle r={PR + 5} fill="none" stroke="rgba(255,120,60,0.15)" strokeWidth="6" />
        <circle r={PR} fill="url(#ll-ember)" />
        <g clipPath="url(#ll-clip)" stroke="#ff7a3d" strokeWidth="1.6" fill="none" filter="url(#ll-glow)">
          <path d="M-32,-6 L-18,2 L-20,14 L-8,20" />
          <path d="M4,-12 L16,0 L28,-2 L36,10" />
          <path d="M-8,32 L4,24 L14,32" />
        </g>
        <circle r={PR} fill="url(#ll-shade)" />
        {/* volcano */}
        <g transform="translate(23 -34) rotate(34)">
          <path d="M-9,3 L-3,-9 L3,-9 L9,3 Z" fill="#3a1414" />
          <ellipse cy="-9" rx="3" ry="1.2" fill="#ffb347" />
          <circle cy="-13" r="2.5" fill="#9aa3c7" className="ll-smoke" />
          <circle cy="-13" r="2.5" fill="#9aa3c7" className="ll-smoke" style={{ animationDelay: "0.7s" }} />
          <circle cy="-13" r="2.5" fill="#9aa3c7" className="ll-smoke" style={{ animationDelay: "1.4s" }} />
        </g>
      </>
    ),
  },
];
