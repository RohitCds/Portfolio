import type { CSSProperties } from "react";

export type Project = {
  id: number;
  title: string;
  description: string;
  techStack: string;
  link: string | null;
  createdAt: string;
};

export type PlanetTheme = {
  name: string;
  light: string;
  mid: string;
  dark: string;
  glow: string;
  dot: string;
  texture: string;
  ring?: string;
};

const BANDS =
  "repeating-linear-gradient(168deg, rgba(255,255,255,.35) 0 7%, rgba(0,0,0,.28) 7% 12%, rgba(255,255,255,.12) 12% 20%, rgba(0,0,0,.32) 20% 24%)";
const SOFT_BANDS =
  "repeating-linear-gradient(175deg, rgba(255,255,255,.22) 0 10%, rgba(0,0,0,.12) 10% 18%, rgba(255,255,255,.05) 18% 30%)";
const CRATERS =
  "radial-gradient(circle at 28% 62%, rgba(0,0,0,.5) 0 7%, rgba(255,255,255,.15) 8%, transparent 10%), radial-gradient(circle at 64% 30%, rgba(0,0,0,.45) 0 5%, rgba(255,255,255,.12) 6%, transparent 8%), radial-gradient(circle at 72% 70%, rgba(0,0,0,.4) 0 9%, rgba(255,255,255,.12) 10%, transparent 12%), radial-gradient(circle at 42% 22%, rgba(0,0,0,.35) 0 3%, transparent 4%)";
const CLOUDS =
  "radial-gradient(ellipse 60% 18% at 35% 30%, rgba(255,255,255,.55), transparent 70%), radial-gradient(ellipse 50% 14% at 65% 58%, rgba(255,255,255,.45), transparent 70%), radial-gradient(ellipse 40% 12% at 30% 78%, rgba(255,255,255,.35), transparent 70%), radial-gradient(circle at 70% 35%, rgba(255,255,255,.4) 0 6%, transparent 13%)";
const CONTINENTS =
  "radial-gradient(ellipse 30% 22% at 30% 40%, rgba(60,200,120,.85), transparent 70%), radial-gradient(ellipse 22% 30% at 68% 62%, rgba(80,190,110,.8), transparent 70%), radial-gradient(ellipse 18% 10% at 55% 22%, rgba(255,255,255,.7), transparent 70%), radial-gradient(ellipse 40% 8% at 40% 85%, rgba(255,255,255,.5), transparent 70%)";

export const PLANET_THEMES: PlanetTheme[] = [
  { name: "Mint ice world", light: "#e2fff5", mid: "#4fd6ad", dark: "#0c4a40", glow: "rgba(110,242,200,.55)", dot: "#6ef2c8", texture: SOFT_BANDS },
  { name: "Amber gas giant", light: "#ffe9bd", mid: "#e39a4c", dark: "#5a2810", glow: "rgba(255,170,90,.45)", dot: "#f4b26a", texture: BANDS, ring: "rgba(255,222,170,.6)" },
  { name: "Violet storm", light: "#ece2ff", mid: "#8d6ef2", dark: "#22135c", glow: "rgba(150,115,255,.5)", dot: "#a58bff", texture: CLOUDS },
  { name: "Ocean world", light: "#d3ebff", mid: "#3b82f6", dark: "#0a1d58", glow: "rgba(90,169,255,.5)", dot: "#5aa9ff", texture: CONTINENTS },
  { name: "Crimson rock", light: "#ffd6ca", mid: "#de5f57", dark: "#470d18", glow: "rgba(255,110,110,.4)", dot: "#ff8a7a", texture: CRATERS },
  { name: "Gilded giant", light: "#fff6cc", mid: "#d8b440", dark: "#4b3a07", glow: "rgba(255,215,90,.4)", dot: "#f2d36b", texture: BANDS, ring: "rgba(220,235,255,.5)" },
];

export const themeFor = (i: number) => PLANET_THEMES[i % PLANET_THEMES.length];

export function themeStyle(t: PlanetTheme): CSSProperties {
  return {
    "--p-light": t.light,
    "--p-mid": t.mid,
    "--p-dark": t.dark,
    "--p-glow": t.glow,
    "--p-texture": t.texture,
    "--p-ring": t.ring,
  } as CSSProperties;
}

// "Resumot – Local Resume Q&A Engine" -> "Resumot"; long titles -> first three words
export function shortName(title: string) {
  const head = title.split(/\s[–—-]\s/)[0].trim();
  const words = head.split(/\s+/);
  return words.length > 3 ? words.slice(0, 3).join(" ") : head;
}

export const techList = (techStack: string) =>
  techStack.split(",").map((s) => s.trim()).filter(Boolean);

export const discovered = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
