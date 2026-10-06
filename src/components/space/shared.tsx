"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const ADMIN_EMAIL = "rohitshroff02@gmail.com";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ index, eyebrow, title, children }: { index: string; eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <Reveal className="mb-14 max-w-3xl">
      <p className="hud mb-4 flex items-center gap-3">
        <span className="text-mint">{index}</span>
        <span className="h-px w-10 bg-line" />
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-star sm:text-6xl">{title}</h2>
      {children && <p className="mt-5 max-w-xl text-base leading-relaxed text-haze sm:text-lg">{children}</p>}
    </Reveal>
  );
}

// Edit button that only renders for the signed-in admin
export function AdminEdit({ href }: { href: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  if (session?.user?.email !== ADMIN_EMAIL) return null;
  return (
    <button
      onClick={() => router.push(href)}
      className="absolute right-6 top-24 z-20 rounded-full border border-mint/40 bg-mint/10 px-4 py-1.5 font-mono text-xs text-mint transition hover:bg-mint/20"
    >
      ✏️ Edit
    </button>
  );
}
