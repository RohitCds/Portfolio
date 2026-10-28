"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { upload } from "@vercel/blob/client";
import {
  HiArrowLeft, HiOutlineArrowDown, HiOutlineArrowUp, HiOutlineCloudUpload, HiOutlineDocument,
  HiOutlineExternalLink, HiOutlinePhotograph, HiOutlineTrash,
} from "react-icons/hi";
import Markdown from "@/components/space/Markdown";
import { Attachment, LOG_KINDS, LogEntryDTO, LogKind, attachmentType, logNumber, slugify } from "@/lib/logbook";

type Form = {
  title: string;
  slug: string;
  kind: LogKind;
  tags: string;
  summary: string;
  sourceTitle: string;
  sourceUrl: string;
  body: string;
  attachments: Attachment[];
  published: boolean;
};

const EMPTY: Form = {
  title: "", slug: "", kind: "deep-dive", tags: "", summary: "", sourceTitle: "", sourceUrl: "", body: "", attachments: [], published: false,
};

const field =
  "w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-star placeholder:text-dim outline-none transition focus:border-mint/60 focus:ring-2 focus:ring-mint/20";

export default function LogEntryEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const [form, setForm] = useState<Form>(EMPTY);
  const [meta, setMeta] = useState<Pick<LogEntryDTO, "id" | "number" | "slug" | "published"> | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [view, setView] = useState<"write" | "preview">("write");
  const [uploads, setUploads] = useState<{ name: string; pct: number }[]>([]);
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const [dragging, setDragging] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/logbook/upload")
      .then((r) => r.json())
      .then((d) => setStorageReady(!!d.configured))
      .catch(() => setStorageReady(false));
    if (isNew) return;
    fetch(`/api/logbook/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((e: LogEntryDTO) => {
        setForm({
          title: e.title, slug: e.slug, kind: e.kind, tags: e.tags.join(", "), summary: e.summary,
          sourceTitle: e.sourceTitle ?? "", sourceUrl: e.sourceUrl ?? "", body: e.body, attachments: e.attachments, published: e.published,
        });
        setMeta({ id: e.id, number: e.number, slug: e.slug, published: e.published });
      })
      .catch(() => toast.error("Couldn't load this entry"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(value as string);
      return next;
    });
    setDirty(true);
  };

  const save = useCallback(
    async (published: boolean) => {
      if (!form.title.trim() || !form.summary.trim()) return toast.error("Title and summary are required");
      setSaving(true);
      const payload = { ...form, published, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await fetch(isNew ? "/api/logbook" : `/api/logbook/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaving(false);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data.error || "Save failed");

      const saved = data as LogEntryDTO;
      setForm((f) => ({ ...f, slug: saved.slug, published: saved.published }));
      setMeta({ id: saved.id, number: saved.number, slug: saved.slug, published: saved.published });
      setDirty(false);
      toast.success(published ? (meta?.published ? "Changes are live" : "Published 🚀") : "Draft saved");
      if (isNew) router.replace(`/logbook/edit/${saved.id}`);
    },
    [form, id, isNew, meta?.published, router]
  );

  // Cmd/Ctrl+S saves without changing the published state
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!saving) save(form.published);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [form.published, save, saving]);

  // wraps the selection in the body textarea (or inserts a snippet at the cursor)
  const insert = (before: string, after = "", placeholder = "") => {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    set("body", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!storageReady) return toast.error("File storage isn't connected yet (see the note above).");
    for (const file of Array.from(files)) {
      setUploads((u) => [...u, { name: file.name, pct: 0 }]);
      try {
        const blob = await upload(`logbook/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/logbook/upload",
          multipart: file.size > 10 * 1024 * 1024,
          onUploadProgress: ({ percentage }) =>
            setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, pct: percentage } : x))),
        });
        setForm((f) => ({
          ...f,
          attachments: [...f.attachments, { url: blob.url, name: file.name, type: attachmentType(file.type, file.name), size: file.size }],
        }));
        setDirty(true);
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "upload failed"}`);
      } finally {
        setUploads((u) => u.filter((x) => x.name !== file.name));
      }
    }
  };

  const moveAttachment = (i: number, d: number) => {
    const list = [...form.attachments];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set("attachments", list);
  };

  if (loading) return <p className="hud p-12">Loading…</p>;

  const live = meta?.published ?? false;

  return (
    <div className="min-h-screen pb-24">
      {/* top bar */}
      <div className="sticky top-0 z-20 border-b border-line bg-void/85 px-6 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <Link href="/logbook/edit" className="hud inline-flex items-center gap-2 hover:text-mint">
            <HiArrowLeft /> All entries
          </Link>
          <span className="font-display text-star">{meta ? `Editing ${logNumber(meta.number)}` : "New entry"}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs ${live ? "bg-mint/15 text-mint" : "bg-amber-400/15 text-amber-300"}`}>
            {live ? "Live" : "Draft"}
          </span>
          {dirty && <span className="hud !text-[10px] text-amber-300">Unsaved changes</span>}
          <div className="ml-auto flex flex-wrap gap-2">
            {meta && (
              <a href={`/logbook/${meta.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2">
                <HiOutlineExternalLink /> {live ? "View" : "Preview"}
              </a>
            )}
            {live ? (
              <>
                <button disabled={saving} onClick={() => save(false)} className="btn-ghost !px-4 !py-2 disabled:opacity-50">Unpublish</button>
                <button disabled={saving} onClick={() => save(true)} className="btn-primary !px-4 !py-2 disabled:opacity-50">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            ) : (
              <>
                <button disabled={saving} onClick={() => save(false)} className="btn-ghost !px-4 !py-2 disabled:opacity-50">
                  {saving ? "Saving…" : "Save draft"}
                </button>
                <button disabled={saving} onClick={() => save(true)} className="btn-primary !px-4 !py-2 disabled:opacity-50">Publish</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl space-y-6 px-6">
        {/* details */}
        <section className="glass space-y-4 rounded-3xl p-6">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Title, e.g. Quantum computing from qubits to Grover's algorithm" className={`${field} font-display text-xl`} aria-label="Title" />
          <div>
            <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} maxLength={300} rows={2} placeholder="One or two sentences. Shown on cards and in LinkedIn previews." className={field} aria-label="Summary" />
            <p className="hud mt-1 text-right !text-[10px]">{form.summary.length}/300</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1">
              <span className="hud !text-[10px]">Type</span>
              <select value={form.kind} onChange={(e) => set("kind", e.target.value as LogKind)} className={field}>
                {(Object.keys(LOG_KINDS) as LogKind[]).map((k) => (
                  <option key={k} value={k} className="bg-deep">{LOG_KINDS[k].label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="hud !text-[10px]">Tags (comma separated)</span>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="quantum, maths" className={field} />
            </label>
            <label className="space-y-1">
              <span className="hud !text-[10px]">URL: /logbook/{form.slug || "…"}</span>
              <input
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
                placeholder="auto from title"
                className={`${field} font-mono text-sm`}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <label className="space-y-1">
              <span className="hud !text-[10px]">Source (paper, course, book): optional</span>
              <input value={form.sourceTitle} onChange={(e) => set("sourceTitle", e.target.value)} placeholder="Attention Is All You Need (Vaswani et al., 2017)" className={field} />
            </label>
            <label className="space-y-1">
              <span className="hud !text-[10px]">Source link</span>
              <input value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} placeholder="https://arxiv.org/abs/1706.03762" className={field} />
            </label>
          </div>
        </section>

        {/* attachments */}
        <section
          className={`glass rounded-3xl p-6 transition ${dragging ? "border-mint/60 bg-mint/5" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-star">Images & PDFs</p>
              <p className="text-sm text-haze">Handwritten pages, figures, slides. Drag files here, or browse. Up to 50 MB each.</p>
            </div>
            <button onClick={() => fileRef.current?.click()} className="btn-ghost !px-4 !py-2">
              <HiOutlineCloudUpload /> Upload files
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {storageReady === false && (
            <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
              File storage isn&apos;t connected yet. In Vercel, open this project, go to <b>Storage</b>, then <b>Create → Blob</b>, and connect it. Writing and publishing text works without it.
            </p>
          )}

          {(form.attachments.length > 0 || uploads.length > 0) && (
            <ul className="mt-5 space-y-2">
              {form.attachments.map((a, i) => (
                <li key={a.url} className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] p-2">
                  {a.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/5 text-xl text-sky"><HiOutlineDocument /></span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm text-star">{a.name}</span>
                  <button onClick={() => insert(a.type === "image" ? `\n![${a.name}](${a.url})\n` : `[${a.name}](${a.url})`)} className="rounded-full px-2.5 py-1 text-xs text-mint hover:bg-mint/10" title="Insert into text">
                    {a.type === "image" ? <HiOutlinePhotograph className="inline" /> : null} Insert
                  </button>
                  <button onClick={() => moveAttachment(i, -1)} aria-label="Move up" className="p-1.5 text-haze hover:text-star"><HiOutlineArrowUp /></button>
                  <button onClick={() => moveAttachment(i, 1)} aria-label="Move down" className="p-1.5 text-haze hover:text-star"><HiOutlineArrowDown /></button>
                  <button onClick={() => set("attachments", form.attachments.filter((_, j) => j !== i))} aria-label="Remove" className="p-1.5 text-haze hover:text-red-400"><HiOutlineTrash /></button>
                </li>
              ))}
              {uploads.map((u) => (
                <li key={u.name} className="rounded-xl border border-line p-3 text-sm text-haze">
                  Uploading {u.name}… {Math.round(u.pct)}%
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-mint transition-all" style={{ width: `${u.pct}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* body */}
        <section className="glass overflow-hidden rounded-3xl">
          <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2">
            {[
              ["H2", () => insert("\n## ", "", "Heading")],
              ["B", () => insert("**", "**", "bold")],
              ["I", () => insert("_", "_", "italic")],
              ["Link", () => insert("[", "](https://)", "text")],
              ["Code", () => insert("\n```\n", "\n```\n", "code")],
              ["∑ Math", () => insert("\n$$\n", "\n$$\n", "\\langle \\psi | \\phi \\rangle")],
              ["Quote", () => insert("\n> ", "", "quote")],
              ["List", () => insert("\n- ", "", "item")],
            ].map(([label, fn]) => (
              <button key={label as string} onClick={fn as () => void} className="rounded-lg px-2.5 py-1 font-mono text-xs text-haze transition hover:bg-white/10 hover:text-star">
                {label as string}
              </button>
            ))}
            <div className="ml-auto flex rounded-full border border-line p-0.5 lg:hidden">
              {(["write", "preview"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1 text-xs capitalize ${view === v ? "bg-mint text-void" : "text-haze"}`}>{v}</button>
              ))}
            </div>
          </div>
          <div className="grid lg:grid-cols-2">
            <textarea
              ref={bodyRef}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder={"Write in Markdown.\n\n## What I studied\n...\n\nMaths works too: $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$"}
              className={`min-h-[60vh] resize-y bg-transparent p-5 font-mono text-sm leading-relaxed text-star outline-none placeholder:text-dim lg:block lg:border-r lg:border-line ${view === "write" ? "block" : "hidden"}`}
              aria-label="Body (Markdown)"
            />
            <div className={`max-h-[80vh] overflow-y-auto p-6 lg:block ${view === "preview" ? "block" : "hidden"}`}>
              {form.body.trim() ? <Markdown>{form.body}</Markdown> : <p className="hud">Preview appears here</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
