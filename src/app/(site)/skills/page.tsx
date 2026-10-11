import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Skills from "@/components/space/Skills";
import { withMinLoad } from "@/lib/minLoad";

// Content is edited through the admin CMS, so always render fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsPage() {
  const skills = await withMinLoad(prisma.skill.findMany({ orderBy: { order: "asc" } }));
  return <Skills skills={skills} />;
}
