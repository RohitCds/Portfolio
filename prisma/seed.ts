import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  // 🧠 ABOUT ME
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

  // 💼 PROJECTS
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
        description:
          "An AI-powered tool to analyze resumes using NLP, Transformers, and RAG pipelines.",
        techStack:
          "Python, Streamlit, Hugging Face Transformers, Mistral 7B, LLaMA, T5, BART, LoRA Fine-tuning, Unsloth, SentenceTransformers, ChromaDB, RAG, LayoutLMv3, OCR, NLP, Semantic Search",
        link: "https://github.com/RohitCds/Resumot",
      },
    ],
    skipDuplicates: true,
  });

  // 🧩 SKILLS
  await prisma.skill.createMany({
    data: [
      { name: "Python, TensorFlow, PyTorch, Scikit-Learn, Transformers (BERT, T5), NLP, PEFT, LoRA, RLHF, PPO, Generative AI, LLM Fine-tuning", category: "Machine Learning & AI", order: 1 },
      { name: "Apache Kafka, PySpark, Airflow, Cassandra, Docker, Oracle Cloud Infrastructure (OCI), Azure, Cloud Deployment", category: "Big Data & Cloud", order: 2 },
      { name: "Oracle Analytics Cloud (OAC), Tableau, Power BI, Data Visualization, Dashboard Development, SQL, Pandas, Seaborn, Matplotlib, Plotly", category: "Data Analytics", order: 3 },
      { name: "React.js, Node.js, Express.js, REST APIs, JavaScript, TypeScript, HTML, CSS, Bootstrap, Passport.js, OAuth 2.0", category: "Full-Stack Development", order: 4 },
      { name: "SQL, MongoDB (Mongoose), ChromaDB, Cassandra, Data Modeling", category: "Databases", order: 5 },
      { name: "Git, GitHub, Streamlit, FastAPI, Jupyter, VS Code, Postman", category: "Other Tools", order: 6 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed data inserted successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
