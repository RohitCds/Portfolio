import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const newProject = await prisma.project.create({
    data: {
      title: "My Portfolio Website",
      description: "A Next.js portfolio with Prisma and PostgreSQL",
      techStack: "Next.js, TypeScript, Prisma, PostgreSQL",
      link: "https://github.com/RohitCds/Portfolio",
    },
  });

  console.log("Project created:", newProject);
}

main()
  .catch((error: any) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });