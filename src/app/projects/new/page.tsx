"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [link, setLink] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, techStack, link }),
    });

    if (res.ok) {
      toast.success("Project added successfully!");
      router.push("/projects");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to add project");
    }
  };

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  return (
    <div className="p-8 max-w-lg mx-auto bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Project</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 p-3 rounded text-gray-800"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 p-3 rounded text-gray-800"
          rows={4}
          required
        />
        <input
          placeholder="Tech Stack (e.g., React, Node.js, MongoDB)"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          className="border border-gray-300 p-3 rounded text-gray-800"
          required
        />
        <input
          placeholder="Project Link (GitHub, Live Demo, etc.)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="border border-gray-300 p-3 rounded text-gray-800"
          required
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Add Project
          </button>
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="bg-gray-400 text-white px-6 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}