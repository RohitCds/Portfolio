import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    await prisma.project.createMany({
        data: [{
            title: "Portfolio Website",
            description: "A Next.js portfolio with Prisma and PostgreSQL",
            techStack: "Next.js, TypeScript, Prisma, PostgreSQL",
            link: "https://github.com/RohitCds/Portfolio",
        },
        {
            title: "Resumot",
            description: "An AI-powered tool to analyze resumes",
            techStack: "Python, Streamlit, Hugging Face Transformers, Mistral 7B, LLaMA, T5, BART, LoRA Fine-tuning, Unsloth, SentenceTransformers, ChromaDB, RAG, LayoutLMv3, OCR (Tesseract/EasyOCR), NLP, Semantic Search",
            link: "https://github.com/RohitCds/Resumot",
        }]
    });
}

main()
    .then(() => {
        console.log("Seed data inserted!");
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });