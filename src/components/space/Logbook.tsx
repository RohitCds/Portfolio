"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiArrowRight, HiOutlinePaperClip } from "react-icons/hi";
import { AdminEdit, Reveal, SectionHeading } from "./shared";
import { LOG_KINDS, LogEntryDTO, LogKind, formatLogDate, logNumber } from "@/lib/logbook";

export type LogListItem = Omit<LogEntryDTO, "body"> & { minutes: number };

export default function Logbook({ entries }: { entries: LogListItem[] }) {
  const [kind, setKind] = useState<LogKind | "all">("all");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => e.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [entries]);

  const kindsPresent = useMemo(() => new Set(entries.map((e) => e.kind)), [entries]);
  const visible = entries.filter((e) => (kind === "all" || e.kind === kind) && (!tag || e.tags.includes(tag)));

  return (
    <section className="relative px-6 pb-24 pt-32">
      <AdminEdit href="/logbook/edit" />
      <div className="mx-auto max-w-5xl">
        <SectionHeading index="04" eyebrow="Logbook" title={<>Notes from <span className="text-aurora">the frontier.</span></>}>
          What I&apos;m studying, in the open: deep dives, research-paper notes, and the handwritten pages behind them.
        </SectionHeading>

        {entries.length === 0 ? (
          <Reveal>
            <div className="glass flex flex-col items-center rounded-3xl px-6 py-16 text-center">
              <span className="relative mb-6 grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#b9ffe9,#6ef2c8_40%,#1d6b5a_100%)] shadow-[0_0_40px_rgba(110,242,200,0.35)]">
                <span className="absolute h-[2px] w-24 -rotate-[18deg] rounded-full bg-white/40" />
              </span>
              <p className="hud text-mint">{logNumber(1)} · in progress</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-star">The first entry is being written.</h3>
              <p className="mt-3 max-w-md text-haze">
                Deep dives, research-paper notes and handwritten study pages will land here. Check back soon.
              </p>
            </div>
          </Reveal>
        ) : (
          <>
            {/* filters */}
            <Reveal className="mb-10 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Chip active={kind === "all"} onClick={() => setKind("all")}>All entries</Chip>
                {(Object.keys(LOG_KINDS) as LogKind[])
                  .filter((k) => kindsPresent.has(k))
                  .map((k) => (
                    <Chip key={k} active={kind === k} onClick={() => setKind(k)} dot={LOG_KINDS[k].color}>
                      {LOG_KINDS[k].label}
                    </Chip>
                  ))}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTag(tag === t ? null : t)}
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] transition ${
                        tag === t ? "bg-mint/15 text-mint" : "text-dim hover:text-haze"
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </Reveal>

            {/* timeline */}
            <ol className="relative space-y-6 md:pl-40">
              <span aria-hidden className="absolute bottom-4 left-[7.25rem] top-4 hidden w-px bg-gradient-to-b from-mint/50 via-line to-transparent md:block" />
              {visible.map((e, i) => (
                <Reveal key={e.id} delay={Math.min(i, 4) * 0.05}>
                  <li className="relative">
                    <div className="absolute -left-40 top-6 hidden w-24 text-right md:block">
                      <p className="font-mono text-sm text-star">{logNumber(e.number)}</p>
                      <p className="hud mt-1 !text-[10px]">{formatLogDate(e.publishedAt)}</p>
                    </div>
                    <span
                      aria-hidden
                      className="absolute -left-[2.85rem] top-7 hidden h-3 w-3 rounded-full ring-4 ring-void md:block"
                      style={{ background: LOG_KINDS[e.kind].color, boxShadow: `0 0 14px ${LOG_KINDS[e.kind].color}` }}
                    />
                    <EntryCard entry={e} />
                  </li>
                </Reveal>
              ))}
              {visible.length === 0 && <p className="hud">No entries match that filter.</p>}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}

function EntryCard({ entry: e }: { entry: LogListItem }) {
  const cover = e.attachments.find((a) => a.type === "image");
  const kind = LOG_KINDS[e.kind];
  return (
    <Link
      href={`/logbook/${e.slug}`}
      className="glass group flex flex-col gap-5 rounded-3xl p-6 transition hover:border-mint/30 hover:bg-white/[0.05] sm:flex-row"
    >
      <div className="min-w-0 flex-1">
        <p className="hud flex flex-wrap items-center gap-x-2 gap-y-1 !text-[10px]">
          <span className="md:hidden">{logNumber(e.number)} ·</span>
          <span style={{ color: kind.color }}>{kind.label}</span>
          <span>· {e.minutes} min read</span>
          {e.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              · <HiOutlinePaperClip /> {e.attachments.length}
            </span>
          )}
          <span className="md:hidden">· {formatLogDate(e.publishedAt)}</span>
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-star transition group-hover:text-mint sm:text-2xl">
          {e.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-haze">{e.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {e.tags.map((t) => (
            <span key={t} className="font-mono text-[11px] text-dim">#{t}</span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-sm text-mint opacity-0 transition group-hover:opacity-100">
            Read <HiArrowRight />
          </span>
        </div>
      </div>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover.url} alt="" loading="lazy" className="h-40 w-full rounded-2xl border border-line object-cover sm:h-auto sm:w-40" />
      )}
    </Link>
  );
}

function Chip({ active, onClick, dot, children }: { active: boolean; onClick: () => void; dot?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition ${
        active ? "border-mint/50 bg-mint/10 text-star" : "border-line text-haze hover:text-star"
      }`}
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  );
}
