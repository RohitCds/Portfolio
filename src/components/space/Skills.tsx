"use client";

import { useMemo, useState } from "react";
import { AdminEdit, Reveal, SectionHeading } from "./shared";

export type Skill = { id: number; category: string; name: string; order: number };

const W = 320;
const H = 120;

// Deterministic PRNG so each constellation keeps its shape between renders
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function constellation(category: string, n: number) {
  const rand = seeded(category);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    let best = { x: 0, y: 0 };
    let bestDist = -1;
    // best-of-12 sampling keeps the stars from clumping
    for (let tries = 0; tries < 12; tries++) {
      const c = { x: 14 + rand() * (W - 28), y: 14 + rand() * (H - 28) };
      const d = pts.length ? Math.min(...pts.map((p) => Math.hypot(p.x - c.x, p.y - c.y))) : 999;
      if (d > bestDist) { best = c; bestDist = d; }
    }
    pts.push(best);
  }
  // connect stars by hopping to the nearest unvisited one, starting from the leftmost
  const order: number[] = [];
  const left = new Set(pts.map((_, i) => i));
  let cur = pts.reduce((m, p, i) => (p.x < pts[m].x ? i : m), 0);
  while (left.size) {
    order.push(cur);
    left.delete(cur);
    let next = -1;
    for (const i of left) if (next < 0 || Math.hypot(pts[i].x - pts[cur].x, pts[i].y - pts[cur].y) < Math.hypot(pts[next].x - pts[cur].x, pts[next].y - pts[cur].y)) next = i;
    cur = next;
  }
  return { pts, order };
}

const ACRONYMS = new Set(["ai", "ml", "nlp", "sql", "api", "apis", "llm", "llms"]);

// "Machine learning & ai" -> "Machine Learning & AI"
function formatCategory(c: string) {
  return c.replace(/[A-Za-z]+/g, (w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)));
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of [...skills].sort((a, b) => a.order - b.order)) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return [...map.entries()];
  }, [skills]);

  return (
    <section id="skills" className="relative px-6 py-32">
      <AdminEdit href="/skills/edit" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="02" eyebrow="Tech constellations" title={<>Every tool, <span className="text-aurora">mapped to the stars.</span></>}>
          Each domain I work in is its own constellation. Hover a skill to find its star.
        </SectionHeading>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map(([category, items], i) => (
            <Reveal key={category} delay={(i % 3) * 0.08}>
              <ConstellationCard category={category} items={items} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConstellationCard({ category, items }: { category: string; items: Skill[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const { pts, order } = useMemo(() => constellation(category, items.length), [category, items.length]);

  return (
    <div className="glass group h-full rounded-3xl p-6 transition hover:border-mint/30">
      <svg viewBox={`0 0 ${W} ${H}`} className="mb-5 w-full overflow-visible" aria-hidden>
        <polyline
          points={order.map((i) => `${pts[i].x},${pts[i].y}`).join(" ")}
          fill="none"
          stroke="rgba(110,242,200,0.22)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        {pts.map((p, i) => {
          const on = hover === i;
          return (
            <g key={i}>
              {on && <circle cx={p.x} cy={p.y} r={14} fill="rgba(110,242,200,0.18)" />}
              <circle
                cx={p.x}
                cy={p.y}
                r={on ? 4.5 : 2.2}
                fill={on ? "#6ef2c8" : "#e9ecf8"}
                style={{ transition: "all .25s", filter: on ? "drop-shadow(0 0 6px #6ef2c8)" : undefined }}
              />
              {on && (
                <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-mint font-mono text-[10px]">
                  {items[i].name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-star">{formatCategory(category)}</h3>
        <span className="hud !text-[10px]">{String(items.length).padStart(2, "0")} stars</span>
      </div>

      <ul className="flex flex-wrap gap-2">
        {items.map((s, i) => (
          <li
            key={s.id}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`cursor-default rounded-full border px-3 py-1 text-[13px] transition ${
              hover === i ? "border-mint/60 bg-mint/10 text-mint" : "border-line text-haze"
            }`}
          >
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
