"use client";

import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { useState } from "react";

export default function HomePage() {
  const [collapsed, setCollapsed] = useState(false);

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
        {/* Home Section */}
        <section className="h-screen bg-black text-white flex flex-col items-center justify-center px-4" id="home">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg mb-8">
            <Image
              src="/Portfolio Pic.jpg"
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
        </section>

        {/* About Section */}
        <section className="h-screen bg-black text-white flex flex-col items-center justify-center px-6" id="about">
          <h2 className="text-5xl font-extrabold mb-6 text-center">
            About Me
          </h2>
          <p className="max-w-3xl text-center text-gray-400 text-lg leading-relaxed">
            Hello there. I’m a software and AI/ML enthusiast who likes to build end-to-end scalable applications. I have experience in Machine Learning, NLP, and cloud technologies, while also having built full-stack web applications. I focus on bridging data, AI, and software to solve real-world problems with innovative solutions. Coupled with a strong sense of leadership and effective communication skills, I thrive in collaborative environments where I can contribute to impactful projects and continuously learn emerging technologies.
          </p>
        </section>

        {/* Skills Section */}
        <section className="h-screen bg-black text-white flex flex-col items-center justify-center px-6" id="skills">
          <h2 className="text-5xl font-extrabold mb-6 text-center">Skills</h2>
          {/* You can add skill bars or cards here */}
        </section>

        {/* Projects Section */}
        <section className="h-screen bg-black text-white flex flex-col items-center justify-center px-6" id="projects">
          <h2 className="text-5xl font-extrabold mb-6 text-center">Projects</h2>
          {/* Add project cards/components here */}
        </section>

        {/* Contact Section */}
        <section className="h-screen bg-black text-white flex flex-col items-center justify-center px-6" id="contact">
          <h2 className="text-5xl font-extrabold mb-6 text-center">Contact</h2>
          {/* Add contact form or info here */}
        </section>
      </main>
    </div>
  );
}