import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  // Seed Projects
  await prisma.project.createMany({
    data: [
      {
        title: "Portfolio Website",
        description: "A Next.js portfolio with Prisma and PostgreSQL",
        techStack: "Next.js, TypeScript, Prisma, PostgreSQL",
        link: "https://github.com/RohitCds/Portfolio",
      },
      {
        title: "Resumot",
        description: "An AI-powered tool to analyze resumes",
        techStack:
          "Python, Streamlit, Hugging Face Transformers, Mistral 7B, LLaMA, T5, BART, LoRA Fine-tuning, Unsloth, SentenceTransformers, ChromaDB, RAG, LayoutLMv3, OCR (Tesseract/EasyOCR), NLP, Semantic Search",
        link: "https://github.com/RohitCds/Resumot",
      },
    ],
  });

  // Seed About Me
  await prisma.aboutMe.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: `Hello there 👋 I’m a software and AI/ML enthusiast passionate about
building end-to-end intelligent systems that make a difference.
I specialize in bridging the gap between data, AI, and full-stack
software engineering — developing impactful products that scale.

I’m driven by curiosity, creativity, and collaboration — aiming to
turn real-world challenges into opportunities for innovation.`,
    },
  });

  console.log("Seed data inserted!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
