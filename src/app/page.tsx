"use client";

import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Social Icons - Top Right */}
      <div className="fixed top-4 right-4 flex gap-4 z-50">
        <a
          href="https://www.linkedin.com/in/your-linkedin-id"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-blue-500 transition duration-300"
        >
          <FaLinkedin className="w-10 h-10" />
        </a>
        <a
          href="https://github.com/your-github-username"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-400 transition duration-300"
        >
          <FaGithub className="w-10 h-10" />
        </a>
        <a
          href="mailto:your.email@example.com"
          className="text-white hover:text-red-500 transition duration-300"
        >
          <HiOutlineMail className="w-10 h-10" />
        </a>
      </div>

      {/* Main scrollable content */}
      <main
        className={`transition-all duration-300 w-full ${
          collapsed ? "ml-20" : "ml-52"
        }`}
      >
        {/* 🏠 Home Section */}
        <section
          id="home"
          className="h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center justify-center px-4"
        >
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg mb-8">
            <Image
              src="/Portfolio.jpg"
              alt="Rohit Shroff"
              width={192}
              height={192}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-50 to-gray-500 bg-clip-text text-transparent bg-[length:200%_auto] text-center">
            Hi, I am Rohit Shroff
          </h1>
          <p className="mt-4 text-lg text-gray-400 text-center max-w-3xl">
            AI Engineer • Full-Stack ML Developer • Problem Solver
          </p>
          <button className="mt-8 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            <a
              href="/Rohit Shroff Resume.pdf"
              download="Rohit Shroff Resume.pdf"
            >
              Download Resume
            </a>
          </button>
        </section>

        {/* 👤 About Section */}
        <section
          id="about"
          className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6"
        >
          <h2 className="text-5xl font-extrabold mb-6 text-center">
            About Me
          </h2>
          <div className="max-w-4xl text-center text-gray-400 text-lg leading-relaxed">
            <p>
              Hello there 👋 I’m a software and AI/ML enthusiast passionate about
              building end-to-end intelligent systems that make a difference.
              I specialize in bridging the gap between data, AI, and full-stack
              software engineering — developing impactful products that scale.
            </p>
            <p className="mt-4">
              I’m driven by curiosity, creativity, and collaboration — aiming to
              turn real-world challenges into opportunities for innovation.
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-6" id="skills">
          <h2 className="text-5xl font-extrabold mb-10 text-center">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl text-gray-300">
            
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Machine Learning & AI</h3>
              <p>Python, TensorFlow, PyTorch, Scikit-Learn, Transformers (BERT, T5), NLP, PEFT, LoRA, RLHF, PPO, Generative AI, LLM Fine-tuning</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Big Data & Cloud</h3>
              <p>Apache Kafka, PySpark, Airflow, Cassandra, Docker, Oracle Cloud Infrastructure (OCI), Azure, Cloud Deployment</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Data Analytics</h3>
              <p>Oracle Analytics Cloud (OAC), Tableau, Power BI, Data Visualization, Dashboard Development, SQL, Pandas, Seaborn, Matplotlib, Plotly</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Full-Stack Development</h3>
              <p>React.js, Node.js, Express.js, REST APIs, JavaScript, TypeScript, HTML, CSS, Bootstrap, Passport.js, OAuth 2.0</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Databases</h3>
              <p>SQL, MongoDB (Mongoose), ChromaDB, Cassandra, Data Modeling</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Other Tools</h3>
              <p>Git, GitHub, Streamlit, FastAPI, Jupyter, VS Code, Postman</p>
            </div>

          </div>
        </section>

        {/* Projects Section */}
        <section className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-20" id="projects">
          <h2 className="text-5xl font-extrabold mb-10 text-center">Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">

            {/* Project 1 */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <h3 className="text-2xl font-bold mb-2">Resumot – Local Resume Q&A Engine</h3>
              <p className="text-gray-400 mb-4">
                Built an offline LLM-powered resume Q&A system using Sentence Transformers, ChromaDB, and DeepSeek-13B with llama-cpp-python. Enables local semantic querying without GPUs or APIs. Frontend built with Streamlit.
              </p>
              <a href="https://github.com/your-resumot-link" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Project →</a>
            </div>

            {/* Project 2 */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <h3 className="text-2xl font-bold mb-2">Dialogue Summarization & Detoxification</h3>
              <p className="text-gray-400 mb-4">
                Enhanced the flan-t5-base model using PEFT and LoRA, combined with PPO for reinforcement learning. Integrated toxicity detection via RoBERTa for safe, ethical summarization with improved ROUGE metrics.
              </p>
              <a href="https://github.com/your-dialogue-link" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Project →</a>
            </div>

            {/* Project 3 */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <h3 className="text-2xl font-bold mb-2">Kafka Data Pipeline for User Analytics</h3>
              <p className="text-gray-400 mb-4">
                End-to-end streaming pipeline using Apache Kafka, Airflow, PySpark, and Cassandra. Designed for scalable ingestion, processing, and real-time analytics of continuous user data streams.
              </p>
              <a href="https://github.com/your-kafka-link" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Project →</a>
            </div>

            {/* Project 4 */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <h3 className="text-2xl font-bold mb-2">College Faculty Review Platform</h3>
              <p className="text-gray-400 mb-4">
                Full-stack web app for anonymous faculty reviews using Node.js, Express, React, and MongoDB. Implemented Google OAuth 2.0 authentication via Passport.js for secure login.
              </p>
              <a href="https://github.com/your-faculty-review-link" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Project →</a>
            </div>

            {/* Project 5 */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <h3 className="text-2xl font-bold mb-2">AI Disaster Response System (Agentic + Multimodal)</h3>
              <p className="text-gray-400 mb-4">
                A simulated startup-scale AI platform integrating real-time image, text, and sensor data for disaster response. Combines multimodal LLMs and agentic workflows for rapid situational awareness.
              </p>
              <a href="https://github.com/your-disaster-ai-link" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Project →</a>
            </div>

          </div>
        </section>


        {/* 📩 Contact Section */}
        <section
          id="contact"
          className="h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center justify-center px-6"
        >
          <h2 className="text-5xl font-extrabold mb-8 text-center">Contact</h2>
          <p className="text-gray-400 mb-6 text-center text-lg max-w-xl">
            Let’s collaborate or just have a chat about AI, tech, or your next
            project idea.
          </p>
          <a
            href="mailto:your.email@example.com"
            className="bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700 transition text-white"
          >
            Get in Touch
          </a>
        </section>
      </main>
    </div>
  );
}
