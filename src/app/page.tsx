import { prisma } from "@/lib/prisma";
import Starfield from "@/components/space/Starfield";
import Nav from "@/components/space/Nav";
import Hero from "@/components/space/Hero";
import About from "@/components/space/About";
import Skills from "@/components/space/Skills";
import OrbitSystem from "@/components/space/OrbitSystem";
import Contact from "@/components/space/Contact";

// Content is edited through the admin CMS, so always render fresh data
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [about, skills, projects] = await Promise.all([
    prisma.aboutMe.findFirst(),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const serializedProjects = projects.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
  const domainCount = new Set(skills.map((s) => s.category.toLowerCase())).size;

  return (
    <div className="relative">
      <Starfield />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <About
          content={about?.content ?? ""}
          projectCount={projects.length}
          skillCount={skills.length}
          domainCount={domainCount}
        />
        <Skills skills={skills} />
        <OrbitSystem projects={serializedProjects} />
        <Contact />
      </main>
    </div>
  );
}
