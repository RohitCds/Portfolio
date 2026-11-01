import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Logbook from "@/components/space/Logbook";
import { withMinLoad, withTimeout } from "@/lib/minLoad";
import { readingMinutes, toLogEntryDTO } from "@/lib/logbook";

// Content is edited through the admin CMS, so always render fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logbook",
  description: "Study notes, deep dives and research-paper write-ups by Rohit Shroff.",
};

// Never leave visitors on the loader: if the database is slow or down, show the "coming soon" view instead
async function publishedEntries() {
  try {
    return await withTimeout(prisma.logEntry.findMany({ where: { published: true }, orderBy: { number: "desc" } }), 5000);
  } catch (error) {
    console.error("Logbook: couldn't load entries", error);
    return [];
  }
}

export default async function LogbookPage() {
  const rows = await withMinLoad(publishedEntries());
  // list cards don't need the full Markdown body
  const entries = rows.map((row) => {
    const { body, ...entry } = toLogEntryDTO(row);
    return { ...entry, minutes: readingMinutes(body) };
  });
  return <Logbook entries={entries} />;
}
