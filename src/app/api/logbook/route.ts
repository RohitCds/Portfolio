import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toLogEntryDTO } from "@/lib/logbook";
import { nextLogNumber, parseEntryInput, uniqueSlug } from "@/lib/logbookServer";

// GET: published entries; ?all=1 (admin only) includes drafts
export async function GET(request: Request) {
  const all = new URL(request.url).searchParams.get("all") === "1";
  if (all) {
    const denied = await requireAdmin();
    if (denied) return denied;
  }
  const rows = await prisma.logEntry.findMany({
    where: all ? {} : { published: true },
    orderBy: { number: "desc" },
  });
  return NextResponse.json(rows.map(toLogEntryDTO));
}

// POST: create an entry (admin only)
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseEntryInput(raw);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data } = parsed;
  const created = await prisma.logEntry.create({
    data: {
      ...data,
      slug: await uniqueSlug(data.slug),
      number: await nextLogNumber(),
      publishedAt: data.published ? new Date() : null,
    },
  });
  return NextResponse.json(toLogEntryDTO(created), { status: 201 });
}
