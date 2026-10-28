import Link from "next/link";
import { HiArrowLeft, HiArrowRight, HiOutlineDocumentText } from "react-icons/hi";
import Markdown from "./Markdown";
import { AdminEdit } from "./shared";
import AttachmentGallery from "./AttachmentGallery";
import ShareBar from "./ShareBar";
import { LOG_KINDS, LogEntryDTO, formatLogDate, logNumber, readingMinutes } from "@/lib/logbook";

type Neighbour = { slug: string; title: string; number: number } | null;

export default function LogEntryView({ entry: e, prev, next }: { entry: LogEntryDTO; prev: Neighbour; next: Neighbour }) {
  const kind = LOG_KINDS[e.kind];
  const gallery = e.attachments.length > 0 && <AttachmentGallery attachments={e.attachments} />;

  return (
    <article className="relative px-6 pb-24 pt-32">
      <AdminEdit href={`/logbook/edit/${e.id}`} />
      <div className="mx-auto max-w-3xl">
        <Link href="/logbook" className="hud inline-flex items-center gap-2 transition hover:text-mint">
          <HiArrowLeft /> Logbook
        </Link>

        <header className="mt-8 border-b border-line pb-8">
          <p className="hud flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-mint">{logNumber(e.number)}</span>
            <span>· {formatLogDate(e.publishedAt)}</span>
            <span>·</span>
            <span style={{ color: kind.color }}>{kind.label}</span>
            <span>· {readingMinutes(e.body)} min read</span>
            {!e.published && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-amber-300">Draft preview</span>}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-star sm:text-5xl">{e.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-haze sm:text-xl">{e.summary}</p>

          {(e.sourceTitle || e.sourceUrl) && (
            <div className="glass mt-6 flex items-start gap-3 rounded-2xl p-4">
              <HiOutlineDocumentText className="mt-0.5 shrink-0 text-xl text-indigo" />
              <div className="min-w-0 text-sm">
                <p className="hud !text-[10px]">Source</p>
                {e.sourceUrl ? (
                  <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="break-words text-star transition hover:text-mint">
                    {e.sourceTitle || e.sourceUrl} ↗
                  </a>
                ) : (
                  <p className="text-star">{e.sourceTitle}</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3">
            {e.tags.map((t) => (
              <span key={t} className="font-mono text-xs text-dim">#{t}</span>
            ))}
            <div className="ml-auto">
              <ShareBar title={e.title} compact />
            </div>
          </div>
        </header>

        {/* handwritten notes are the main content of a notes entry, so they come first */}
        {e.kind === "notes" && gallery && <div className="mt-10">{gallery}</div>}

        {e.body.trim() && <Markdown className="mt-10 sm:prose-lg">{e.body}</Markdown>}

        {e.kind !== "notes" && gallery && (
          <div className="mt-12">
            <p className="hud mb-4">Attachments</p>
            {gallery}
          </div>
        )}

        <footer className="mt-16 space-y-8 border-t border-line pt-8">
          <div className="glass flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
            <p className="text-sm text-haze">Found this useful? Pass it along.</p>
            <ShareBar title={e.title} />
          </div>

          {(prev || next) && (
            <nav className="grid gap-3 sm:grid-cols-2" aria-label="More entries">
              {prev ? <NeighbourLink entry={prev} label="Previous" /> : <span />}
              {next && <NeighbourLink entry={next} label="Next" alignRight />}
            </nav>
          )}
        </footer>
      </div>
    </article>
  );
}

function NeighbourLink({ entry, label, alignRight = false }: { entry: NonNullable<Neighbour>; label: string; alignRight?: boolean }) {
  return (
    <Link
      href={`/logbook/${entry.slug}`}
      className={`glass group rounded-2xl p-4 transition hover:border-mint/30 ${alignRight ? "sm:text-right" : ""}`}
    >
      <p className={`hud flex items-center gap-1 !text-[10px] ${alignRight ? "sm:justify-end" : ""}`}>
        {!alignRight && <HiArrowLeft />} {label} · {logNumber(entry.number)} {alignRight && <HiArrowRight />}
      </p>
      <p className="mt-1 font-display text-star transition group-hover:text-mint">{entry.title}</p>
    </Link>
  );
}
