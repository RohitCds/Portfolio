import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import OrbitSystem from "@/components/space/OrbitSystem";
import { withMinLoad } from "@/lib/minLoad";

// Content is edited through the admin CMS, so always render fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await withMinLoad(prisma.project.findMany({ orderBy: { createdAt: "desc" } }));
  return <OrbitSystem projects={projects.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))} />;
}
