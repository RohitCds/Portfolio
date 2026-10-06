"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail, HiOutlineClipboardCopy } from "react-icons/hi";
import { Reveal } from "./shared";

const EMAIL = "rohitshroff02@gmail.com";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      toast.success("Email copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden px-6 pb-56 pt-32 sm:pb-64">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="hud mb-5 flex items-center justify-center gap-3">
            <span className="text-mint">04</span>
            <span className="h-px w-10 bg-line" />
            Open a channel
          </p>
          <h2 className="font-display text-5xl font-semibold leading-[1] tracking-tight sm:text-7xl">
            Let&apos;s build something
            <br />
            <span className="text-aurora">out of this world.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-haze">
            Collaborations, roles, or just a chat about AI, data and what you&apos;re building next. My inbox is always in range.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${EMAIL}`} className="btn-primary">
              <HiOutlineMail className="text-lg" /> Send a transmission
            </a>
            <button onClick={copy} className="btn-ghost font-mono !text-xs">
              <HiOutlineClipboardCopy /> {copied ? "Copied!" : EMAIL}
            </button>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-2xl text-haze">
            <a href="https://www.linkedin.com/in/rohit-shroff/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition hover:text-mint"><FaLinkedin /></a>
            <a href="https://github.com/RohitCds" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="transition hover:text-mint"><FaGithub /></a>
          </div>
        </Reveal>
      </div>

      {/* planet horizon */}
      <div aria-hidden className="pointer-events-none absolute -bottom-[118vw] left-1/2 h-[140vw] w-[140vw] -translate-x-1/2 rounded-full sm:-bottom-[126vw]"
        style={{
          background: "radial-gradient(circle at 50% 0%, #1b2a6b 0%, #0b1236 35%, #05070f 60%)",
          boxShadow: "0 -2px 0 rgba(110,242,200,0.5), 0 -30px 120px rgba(90,169,255,0.35), inset 0 30px 80px rgba(110,242,200,0.15)",
        }}
      />
    </section>
  );
}
