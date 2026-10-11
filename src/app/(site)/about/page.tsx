import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import About from "@/components/space/About";
import { withMinLoad } from "@/lib/minLoad";

// Content is edited through the admin CMS, so always render fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [about, projectCount, skills] = await withMinLoad(
    Promise.all([
      prisma.aboutMe.findFirst(),
      prisma.project.count(),
      prisma.skill.findMany({ select: { category: true } }),
    ])
  );

  return (
    <About
      content={about?.content ?? ""}
      projectCount={projectCount}
      skillCount={skills.length}
      domainCount={new Set(skills.map((s) => s.category.toLowerCase())).size}
    />
  );
}
