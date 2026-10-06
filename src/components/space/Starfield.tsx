"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; layer: number; phase: number; speed: number; tint: string };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

const TINTS = ["#ffffff", "#ffffff", "#ffffff", "#cfe0ff", "#bff7e6", "#e2d6ff"];
const LAYER_PARALLAX = [0.02, 0.06, 0.12];

// Fixed full-viewport canvas: three parallax layers of twinkling stars plus the occasional meteor.
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let nextMeteor = performance.now() + 4000;
    let raf = 0;
    let mouseX = 0, mouseY = 0, smx = 0, smy = 0;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 2600);
      // stars wrap vertically over a taller field so parallax scrolling never runs dry
      stars = Array.from({ length: count }, () => {
        const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 1 : 2;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: [0.5, 0.9, 1.4][layer] * (0.6 + Math.random() * 0.6),
          layer,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.6,
          tint: TINTS[Math.floor(Math.random() * TINTS.length)],
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;
      smx += (mouseX - smx) * 0.04;
      smy += (mouseY - smy) * 0.04;

      for (const s of stars) {
        const p = LAYER_PARALLAX[s.layer];
        let y = (s.y - scroll * p - smy * p * 40) % h;
        if (y < 0) y += h;
        let x = (s.x - smx * p * 40) % w;
        if (x < 0) x += w;
        const twinkle = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
        ctx.globalAlpha = twinkle * (0.45 + s.layer * 0.25);
        ctx.fillStyle = s.tint;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) {
        if (!meteor && t > nextMeteor) {
          const fromLeft = Math.random() < 0.5;
          meteor = {
            x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
            y: Math.random() * h * 0.4,
            vx: (fromLeft ? 1 : -1) * (9 + Math.random() * 5),
            vy: 4 + Math.random() * 3,
            life: 1,
          };
        }
        if (meteor) {
          const m = meteor;
          const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
          grad.addColorStop(0, `rgba(255,255,255,${m.life})`);
          grad.addColorStop(1, "rgba(110,242,200,0)");
          ctx.globalAlpha = 1;
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
          ctx.stroke();
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 0.012;
          if (m.life <= 0 || m.x < -200 || m.x > w + 200 || m.y > h + 200) {
            meteor = null;
            nextMeteor = t + 6000 + Math.random() * 9000;
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX / w - 0.5;
      mouseY = e.clientY / h - 0.5;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    build();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    window.addEventListener("mousemove", onMouse);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {/* nebula wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_10%,rgba(91,80,220,0.22),transparent_70%),radial-gradient(ellipse_60%_45%_at_90%_35%,rgba(40,180,160,0.13),transparent_70%),radial-gradient(ellipse_80%_60%_at_50%_110%,rgba(60,90,220,0.18),transparent_70%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
