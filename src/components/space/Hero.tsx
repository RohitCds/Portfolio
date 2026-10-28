"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail, HiOutlineDownload, HiArrowRight } from "react-icons/hi";
import { PAGES } from "./Nav";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden px-6 pb-10 pt-28">
      <div className="mx-auto my-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            className="hud mb-6 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-mint shadow-[0_0_10px_#6ef2c8]" />
            AI Engineer · Full-Stack ML Developer · Problem Solver
          </motion.p>

          <motion.h1
            className="font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.1 }}
          >
            Hi, I&apos;m
            <br />
            <span className="text-aurora">Rohit Shroff.</span>
          </motion.h1>

          <motion.p
            className="mt-7 max-w-xl text-lg leading-relaxed text-haze"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
          >
            I build end-to-end intelligent systems: fine-tuned language models, retrieval pipelines,
            real-time data infrastructure, and the full-stack apps that ship them.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
          >
            <Link href="/projects" className="btn-primary">
              Explore my system <HiArrowRight />
            </Link>
            <a href="/Rohit Shroff Resume.pdf" download="Rohit Shroff Resume.pdf" className="btn-ghost">
              <HiOutlineDownload /> Download résumé
            </a>
          </motion.div>

          <motion.div
            className="mt-10 flex items-center gap-5 text-haze"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <SocialLink href="https://www.linkedin.com/in/rohit-shroff/" label="LinkedIn"><FaLinkedin /></SocialLink>
            <SocialLink href="https://github.com/RohitCds" label="GitHub"><FaGithub /></SocialLink>
            <SocialLink href="mailto:rohitshroff02@gmail.com" label="Email"><HiOutlineMail /></SocialLink>
          </motion.div>
        </div>

        {/* Mascot floating inside its own little orbit */}
        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[460px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
        >
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(110,242,200,0.18),rgba(123,127,246,0.12)_45%,transparent_70%)] blur-2xl" />
          <div className="absolute inset-0 animate-spin-slower rounded-full border border-dashed border-white/10" />
          <div className="absolute inset-[12%] animate-spin-slow rounded-full border border-mint/20">
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-mint shadow-[0_0_14px_#6ef2c8]" />
          </div>
          <div className="absolute inset-[6%] animate-float">
            <Image
              src="/mascot.png"
              alt="Rohit's astronaut mascot waving hello"
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 460px"
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            />
          </div>
        </motion.div>
      </div>

      {/* Destinations: one card per page */}
      <motion.nav
        aria-label="Pages"
        className="mx-auto mt-14 grid w-full max-w-6xl grid-cols-2 gap-3 md:grid-cols-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.8 }}
      >
        {PAGES.map((p, i) => (
          <Link key={p.href} href={p.href} className="glass group rounded-2xl px-5 py-4 transition last:col-span-2 hover:border-mint/40 hover:bg-white/[0.05] md:last:col-span-1">
            <span className="hud block !text-[10px]">
              <span className="text-mint">{String(i + 1).padStart(2, "0")}</span> · {p.blurb}
            </span>
            <span className="mt-1 flex items-center justify-between font-display text-lg text-star">
              {p.label}
              <HiArrowRight className="text-haze transition group-hover:translate-x-1 group-hover:text-mint" />
            </span>
          </Link>
        ))}
      </motion.nav>
    </section>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label={label}
      className="text-2xl transition hover:-translate-y-0.5 hover:text-mint"
    >
      {children}
    </a>
  );
}
