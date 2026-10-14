"use client";

import Image from "next/image";
import { AdminEdit, Reveal, SectionHeading } from "./shared";
import AlienPet from "./AlienPet";

type Props = { content: string; projectCount: number; skillCount: number; domainCount: number };

export default function About({ content, projectCount, skillCount, domainCount }: Props) {
  const stats = [
    { value: projectCount, label: "Worlds launched" },
    { value: skillCount, label: "Technologies" },
    { value: domainCount, label: "Domains" },
  ];

  return (
    <section id="about" className="relative px-6 py-32">
      <AdminEdit href="/about/edit" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="01" eyebrow="Crew profile" title={<>The human behind <span className="text-aurora">the mission.</span></>} />

        {/* extra top margin leaves room for Blip hovering above the ID card */}
        <div className="mt-28 grid gap-10 lg:grid-cols-[340px_1fr]">
          {/* ID badge */}
          <Reveal className="relative">
            <AlienPet className="absolute -top-[132px] right-3 z-10" />
            <div className="glass relative overflow-hidden rounded-3xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="hud text-mint">Crew ID · RS-001</span>
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-mint" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-line">
                <Image src="/Profile Pic LinkedIn.jpeg" alt="Rohit Shroff" fill sizes="340px" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(160deg,#6ef2c8,#7b7ff6)] opacity-25 mix-blend-multiply" />
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.08)_0_1px,transparent_1px_3px)]" />
                <div className="absolute inset-0 bg-[linear-gradient(transparent_60%,rgba(4,5,12,0.55))]" />
              </div>
              <dl className="mt-6 space-y-3 font-mono text-xs">
                <Row k="Name" v="Rohit Shroff" />
                <Row k="Role" v="AI Engineer" />
                <Row k="Specialty" v="LLMs · Data · Full-stack" />
                <Row k="Missions" v={String(projectCount).padStart(2, "0")} />
                <Row k="Co-pilot" v="Blip (alien)" />
              </dl>
              {/* barcode flourish */}
              <div className="mt-6 flex h-8 gap-[3px] opacity-40">
                {Array.from({ length: 42 }, (_, i) => (
                  <span key={i} className="bg-star" style={{ width: (i * 7) % 3 === 0 ? 3 : 1 }} />
                ))}
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col justify-between gap-10">
            <Reveal delay={0.1}>
              <p className="hud mb-4">Mission brief</p>
              <div className="space-y-5 font-display text-xl leading-relaxed text-star/90 sm:text-2xl">
                {paragraphs(content).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="grid grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <div className="font-display text-4xl font-semibold text-star sm:text-5xl">{s.value}</div>
                    <div className="hud mt-2 !text-[10px]">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// The CMS stores hard-wrapped text: join wrapped lines, keep blank lines as paragraph breaks
function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <dt className="uppercase tracking-[0.18em] text-dim">{k}</dt>
      <dd className="text-right text-star">{v}</dd>
    </div>
  );
}
