"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiPlus } from "react-icons/hi";
import { LOG_KINDS, LogEntryDTO, formatLogDate, logNumber } from "@/lib/logbook";

export default function LogbookAdmin() {
  const [entries, setEntries] = useState<LogEntryDTO[] | null>(null);

  const load = () =>
    fetch("/api/logbook?all=1")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setEntries)
      .catch(() => toast.error("Couldn't load entries"));

  useEffect(() => {
    load();
  }, []);

  const remove = async (e: LogEntryDTO) => {
    if (!confirm(`Delete "${e.title}"? Its uploaded files are deleted too. This can't be undone.`)) return;
    const res = await fetch(`/api/logbook/${e.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Entry deleted");
      load();
    } else toast.error("Delete failed");
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="hud text-mint">Mission control</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-star">Logbook entries</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/logbook" className="btn-ghost !py-2">View logbook</Link>
            <Link href="/logbook/edit/new" className="btn-primary !py-2">
              <HiPlus /> New entry
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {entries === null && <p className="hud">Loading…</p>}
          {entries?.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-haze">
              No entries yet. Start with <Link href="/logbook/edit/new" className="text-mint">your first one</Link>.
            </div>
          )}
          {entries?.map((e) => (
            <div key={e.id} className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
              <div className="w-20 font-mono text-sm text-haze">{logNumber(e.number)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-star">{e.title}</p>
                <p className="hud !text-[10px]">
                  <span style={{ color: LOG_KINDS[e.kind].color }}>{LOG_KINDS[e.kind].label}</span> ·{" "}
                  {e.published ? `Published ${formatLogDate(e.publishedAt)}` : "Draft"} · {e.attachments.length} files
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs ${e.published ? "bg-mint/15 text-mint" : "bg-amber-400/15 text-amber-300"}`}>
                {e.published ? "Live" : "Draft"}
              </span>
              <div className="flex gap-1">
                <IconLink href={`/logbook/${e.slug}`} label="View"><HiOutlineEye /></IconLink>
                <IconLink href={`/logbook/edit/${e.id}`} label="Edit"><HiOutlinePencil /></IconLink>
                <button onClick={() => remove(e)} aria-label="Delete" title="Delete" className="grid h-9 w-9 place-items-center rounded-full text-haze transition hover:bg-red-500/15 hover:text-red-400">
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} title={label} className="grid h-9 w-9 place-items-center rounded-full text-haze transition hover:bg-white/10 hover:text-star">
      {children}
    </Link>
  );
}
