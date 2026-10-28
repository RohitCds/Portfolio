import { prisma } from "@/lib/prisma";
import { Attachment, LOG_KINDS, RESERVED_SLUGS, isHttpUrl, slugify } from "@/lib/logbook";

type EntryInput = {
  title: string;
  summary: string;
  kind: string;
  tags: string[];
  body: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  attachments: Attachment[];
  published: boolean;
  slug: string;
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Validates an editor payload; returns either clean data or a user-facing error message
export function parseEntryInput(raw: unknown): { data: EntryInput } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Invalid request body" };
  const b = raw as Record<string, unknown>;

  const title = str(b.title, 160);
  const summary = str(b.summary, 300);
  const kind = str(b.kind, 20) || "deep-dive";
  const body = typeof b.body === "string" ? b.body.slice(0, 200_000) : "";
  const sourceTitle = str(b.sourceTitle, 200) || null;
  const sourceUrl = str(b.sourceUrl, 500) || null;

  if (!title) return { error: "Title is required" };
  if (!summary) return { error: "Summary is required" };
  if (!(kind in LOG_KINDS)) return { error: "Unknown entry type" };
  if (sourceUrl && !isHttpUrl(sourceUrl)) return { error: "Source link must be an http(s) URL" };

  const rawTags = Array.isArray(b.tags) ? b.tags : typeof b.tags === "string" ? b.tags.split(",") : [];
  const tags = [...new Set(rawTags.map((t) => str(t, 30)).filter(Boolean))].slice(0, 8);

  const rawAttachments = Array.isArray(b.attachments) ? b.attachments.slice(0, 40) : [];
  const attachments: Attachment[] = [];
  for (const a of rawAttachments) {
    if (!a || typeof a !== "object") continue;
    const { url, name, type, size } = a as Record<string, unknown>;
    if (typeof url !== "string" || !url.startsWith("https://")) return { error: "Attachments must be https URLs" };
    attachments.push({
      url,
      name: str(name, 200) || "attachment",
      type: type === "image" || type === "pdf" ? type : "file",
      size: typeof size === "number" ? size : undefined,
    });
  }

  const slug = slugify(str(b.slug, 120) || title);
  if (!slug) return { error: "Title needs at least one letter or number" };
  if (RESERVED_SLUGS.has(slug)) return { error: `"${slug}" is reserved; pick another slug` };

  return {
    data: { title, summary, kind, tags, body, sourceTitle, sourceUrl, attachments, published: b.published === true, slug },
  };
}

// Appends -2, -3… until the slug is free (ignoring the entry being edited)
export async function uniqueSlug(base: string, excludeId?: number) {
  let candidate = base;
  for (let i = 2; ; i++) {
    const clash = await prisma.logEntry.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${base}-${i}`.slice(0, 90);
  }
}

export async function nextLogNumber() {
  const last = await prisma.logEntry.aggregate({ _max: { number: true } });
  return (last._max.number ?? 0) + 1;
}
