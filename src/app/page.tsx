"use client";

import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [aboutContent, setAboutContent] = useState("");
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);


useEffect(() => {
  fetch("/api/about")
    .then((res) => res.json())
    .then((data) => setAboutContent(data.content));

  fetch("/api/skills")
    .then((res) => res.json())
    .then((data) => setSkills(data.sort((a: any, b: any) => a.order - b.order)));

  // Fetch projects from database
  fetch("/api/projects")
    .then((res) => res.json())
    .then((data) => setProjects(data));
}, []);



  if (status === "loading") return <p>Loading...</p>;

  // Check if logged-in user is admin
  const isAdmin = session?.user?.email === "rohitshroff02@gmail.com";

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Social Icons - Top Right */}
      <div className="fixed top-4 right-4 flex gap-4 z-50">
        <a
          href="https://www.linkedin.com/in/rohit-shroff/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-blue-500 transition duration-300"
        >
          <FaLinkedin className="w-10 h-10" />
        </a>
        <a
          href="https://github.com/RohitCds"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-400 transition duration-300"
        >
          <FaGithub className="w-10 h-10" />
        </a>
        <a
          href="mailto:rohitshroff02@gmail.com"
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
          className="relative h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center justify-center px-4"
        >
          

          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg mb-8">
            <Image
              src="/Profile Pic LinkedIn.jpeg"
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

        {/* About Me Section */}
        <section className="relative h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">
          {isAdmin && (
            <button
              onClick={() => router.push("/about/edit")}
              className="absolute top-6 right-6 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg"
            >
              ✏️ Edit
            </button>
          )}

          <h2 className="text-5xl font-extrabold mb-6 text-center">About Me</h2>
          <div className="max-w-4xl text-center text-gray-400 text-lg leading-relaxed whitespace-pre-line">
            {aboutContent}
          </div>
        </section>

        {/* Skills Section */}
        <section
          id="skills"
          className="relative min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-6"
        >
          {isAdmin && (
            <button
              onClick={() => router.push("/skills/edit")}
              className="absolute top-6 right-6 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg"
            >
              ✏️ Edit
            </button>
          )}

          <h2 className="text-5xl font-extrabold mb-10 text-center">Skills</h2>

          {/* Group skills by category */}
          {(() => {
            const grouped = skills.reduce((acc: Record<string, string[]>, skill: any) => {
              if (!acc[skill.category]) acc[skill.category] = [];
              acc[skill.category].push(skill.name);
              return acc;
            }, {});

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl text-gray-300">
                {Object.entries(grouped).map(([category, skillNames]) => (
                  <div key={category}>
                    <h3 className="text-2xl font-semibold mb-3 text-white">
                      {category}
                    </h3>
                    <p>{(skillNames as string[]).join(", ")}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>


        {/* Projects Section */}
        <section
          id="projects"
          className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-20"
        >
          {isAdmin && (
            <button
              onClick={() => router.push("/projects/edit")}
              className="absolute top-6 right-6 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg"
            >
              ✏️ Edit
            </button>
          )}

          <h2 className="text-5xl font-extrabold mb-10 text-center">Projects</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition"
              >
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View Project →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 📩 Contact Section */}
        <section
          id="contact"
          className="relative h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center justify-center px-6"
        >

          <h2 className="text-5xl font-extrabold mb-8 text-center">Contact</h2>
          <p className="text-gray-400 mb-6 text-center text-lg max-w-xl">
            Let’s collaborate or just have a chat about AI, tech, or your next
            project idea.
          </p>
          <a
            href="mailto:rohitshroff02@gmail.com"
            className="bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700 transition text-white"
          >
            Get in Touch
          </a>
        </section>
      </main>
    </div>
  );
}