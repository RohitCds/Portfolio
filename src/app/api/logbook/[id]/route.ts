import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Attachment, toLogEntryDTO } from "@/lib/logbook";
import { parseEntryInput, uniqueSlug } from "@/lib/logbookServer";

type Ctx = { params: Promise<{ id: string }> };

async function findEntry(ctx: Ctx) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return null;
  return prisma.logEntry.findUnique({ where: { id } });
}

// Deletes uploaded files that an entry no longer references (best effort)
async function removeBlobs(urls: string[]) {
  if (!urls.length || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(urls);
  } catch (error) {
    console.error("Failed to delete logbook attachments", error);
  }
}

// GET: one entry including drafts, for the editor (admin only)
export async function GET(_request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const entry = await findEntry(ctx);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toLogEntryDTO(entry));
}

// PUT: update an entry (admin only)
export async function PUT(request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const existing = await findEntry(ctx);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseEntryInput(raw);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data } = parsed;
  const updated = await prisma.logEntry.update({
    where: { id: existing.id },
    data: {
      ...data,
      slug: await uniqueSlug(data.slug, existing.id),
      // first publish stamps the date; unpublishing keeps it so re-publishing doesn't reorder history
      publishedAt: data.published ? existing.publishedAt ?? new Date() : existing.publishedAt,
    },
  });

  const kept = new Set(data.attachments.map((a) => a.url));
  const dropped = ((existing.attachments as Attachment[]) ?? []).map((a) => a.url).filter((u) => !kept.has(u));
  await removeBlobs(dropped);

  return NextResponse.json(toLogEntryDTO(updated));
}

// DELETE: remove an entry and its uploaded files (admin only)
export async function DELETE(_request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const existing = await findEntry(ctx);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.logEntry.delete({ where: { id: existing.id } });
  await removeBlobs(((existing.attachments as Attachment[]) ?? []).map((a) => a.url));
  return NextResponse.json({ ok: true });
}
