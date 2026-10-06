"use client";

import { useEffect, useState } from "react";
import { HiOutlineDownload } from "react-icons/hi";

const LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["home", ...LINKS.map((l) => l.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className={`flex items-center gap-1 rounded-full border px-2 py-2 transition-all duration-500 ${
          scrolled ? "border-line bg-void/70 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl" : "border-transparent"
        }`}
      >
        <a href="#home" className="group mr-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3" aria-label="Back to top">
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#b9ffe9,#6ef2c8_40%,#1d6b5a_100%)] shadow-[0_0_18px_rgba(110,242,200,0.5)]">
            <span className="absolute h-[2px] w-12 -rotate-[18deg] rounded-full bg-white/50" />
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline">Rohit Shroff</span>
        </a>

        {LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={`relative rounded-full px-3 py-1.5 text-[13px] transition-colors sm:px-4 ${
              active === l.id ? "text-void" : "text-haze hover:text-star"
            }`}
          >
            {active === l.id && <span className="absolute inset-0 rounded-full bg-mint" />}
            <span className="relative">{l.label}</span>
          </a>
        ))}

        <a
          href="/Rohit Shroff Resume.pdf"
          download="Rohit Shroff Resume.pdf"
          className="ml-1 hidden items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-star transition hover:border-mint/60 hover:text-mint md:inline-flex"
        >
          <HiOutlineDownload /> Résumé
        </a>
      </nav>
    </header>
  );
}
