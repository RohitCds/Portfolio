import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DiffusionLab from "@/components/space/DiffusionLab";
import { prisma } from "@/lib/prisma";
import { minLoad } from "@/lib/minLoad";

// Rendered per request so the minimum load time (and the launch loader) applies every visit
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diffusion, step by step",
  description: "How image generators turn static into a picture, in six short steps with runnable code on GitHub.",
};

// The lab lives beside its Logbook post; this address (linked from the GitHub repo) forwards there
// once that post is published, and shows the standalone lab until then.
async function publishedLog() {
  try {
    return await prisma.logEntry.findFirst({ where: { lab: "diffusion", published: true }, orderBy: { number: "asc" }, select: { slug: true } });
  } catch (error) {
    console.error("Lab: couldn't look up its Logbook post", error);
    return null;
  }
}

export default async function DiffusionLabPage() {
  const [log] = await Promise.all([publishedLog(), minLoad()]);
  if (log) redirect(`/logbook/${log.slug}`);
  return <DiffusionLab />;
}
