import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { withMinLoad } from "@/lib/minLoad";
import { toLogEntryDTO } from "@/lib/logbook";
import LogEntryView from "@/components/space/LogEntryView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await prisma.logEntry.findUnique({ where: { slug } });
  if (!entry || !entry.published) return { title: "Logbook" };
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/logbook/${entry.slug}` },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.summary,
      url: `/logbook/${entry.slug}`,
      publishedTime: entry.publishedAt?.toISOString(),
      authors: ["Rohit Shroff"],
      tags: entry.tags,
    },
    twitter: { card: "summary_large_image", title: entry.title, description: entry.summary },
  };
}

export default async function LogEntryPage({ params }: Props) {
  const { slug } = await params;
  const [row, session] = await withMinLoad(
    Promise.all([prisma.logEntry.findUnique({ where: { slug } }), getServerSession(authOptions)])
  );
  // drafts are only visible to the signed-in admin (as a preview)
  if (!row || (!row.published && !session)) notFound();

  const [prev, next] = row.published
    ? await Promise.all([
        prisma.logEntry.findFirst({ where: { published: true, number: { lt: row.number } }, orderBy: { number: "desc" }, select: { slug: true, title: true, number: true } }),
        prisma.logEntry.findFirst({ where: { published: true, number: { gt: row.number } }, orderBy: { number: "asc" }, select: { slug: true, title: true, number: true } }),
      ])
    : [null, null];

  return <LogEntryView entry={toLogEntryDTO(row)} prev={prev} next={next} />;
}
