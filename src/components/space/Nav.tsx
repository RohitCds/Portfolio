"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineDownload, HiMenuAlt3, HiX } from "react-icons/hi";

export const PAGES = [
  { href: "/about", label: "About", blurb: "Crew profile" },
  { href: "/skills", label: "Skills", blurb: "Tech constellations" },
  { href: "/projects", label: "Projects", blurb: "Project system" },
  { href: "/logbook", label: "Logbook", blurb: "Study notes" },
  { href: "/contact", label: "Contact", blurb: "Open a channel" },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const current = PAGES.find((p) => isActive(pathname, p.href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // close the mobile menu after navigating
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className={`relative flex items-center gap-1 rounded-full border px-2 py-2 transition-all duration-500 max-sm:w-full ${
          scrolled || menuOpen ? "border-line bg-void/70 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl" : "border-transparent"
        }`}
      >
        <Link href="/" className="group mr-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3" aria-label="Home">
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#b9ffe9,#6ef2c8_40%,#1d6b5a_100%)] shadow-[0_0_18px_rgba(110,242,200,0.5)]">
            <span className="absolute h-[2px] w-12 -rotate-[18deg] rounded-full bg-white/50" />
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline">Rohit Shroff</span>
        </Link>

        {/* desktop / tablet: inline links */}
        {PAGES.map((p) => {
          const active = isActive(pathname, p.href);
          return (
            <Link
              key={p.href}
              href={p.href}
              aria-current={active ? "page" : undefined}
              className={`relative hidden rounded-full px-3 py-1.5 text-[13px] transition-colors sm:inline-block lg:px-4 ${
                active ? "text-void" : "text-haze hover:text-star"
              }`}
            >
              {active && <span className="absolute inset-0 rounded-full bg-mint" />}
              <span className="relative">{p.label}</span>
            </Link>
          );
        })}

        <a
          href="/Rohit Shroff Resume.pdf"
          download="Rohit Shroff Resume.pdf"
          className="ml-1 hidden items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-star transition hover:border-mint/60 hover:text-mint md:inline-flex"
        >
          <HiOutlineDownload /> Résumé
        </a>

        {/* phone: current page + menu button */}
        <span className="font-display text-sm text-star sm:hidden">{current?.label ?? "Rohit Shroff"}</span>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-line text-lg text-star sm:hidden"
        >
          {menuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-3xl border border-line bg-[#070915]/[0.97] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {PAGES.map((p, i) => {
                const active = isActive(pathname, p.href);
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 ${active ? "bg-mint/10 text-mint" : "text-star"}`}
                  >
                    <span className="font-display">{p.label}</span>
                    <span className="hud !text-[10px]">{String(i + 1).padStart(2, "0")} · {p.blurb}</span>
                  </Link>
                );
              })}
              <a
                href="/Rohit Shroff Resume.pdf"
                download="Rohit Shroff Resume.pdf"
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm text-star"
              >
                <HiOutlineDownload /> Download résumé
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
