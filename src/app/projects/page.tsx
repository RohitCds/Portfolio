"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    link: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch projects
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => setProjects(data));
    }
  }, [status]);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted successfully!");
    } else {
      toast.error("Failed to delete project.");
    }
  };

  const handleEditClick = (project: any) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      link: project.link,
    });
  };

  const handleUpdate = async (id: number) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      toast.success("Project updated successfully!");
    } else {
      toast.error("Failed to update project.");
    }
  };

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Projects</h1>
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/projects/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Add Project
        </Link>
        <Link
          href="/"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Back to Home
        </Link>
      </div>

      <ul className="space-y-4">
        {projects.map((project) => (
          <li
            key={project.id}
            className="border border-gray-300 p-4 rounded-lg flex justify-between items-center bg-gray-50"
          >
            {editingId === project.id ? (
              <div className="flex flex-col gap-2 flex-1 mr-4">
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded text-gray-800"
                  placeholder="Title"
                />
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded text-gray-800"
                  placeholder="Description"
                  rows={3}
                />
                <input
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded text-gray-800"
                  placeholder="Tech Stack"
                />
                <input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded text-gray-800"
                  placeholder="Project Link"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(project.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-gray-800">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {project.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.techStack}
                  </p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm mt-1 inline-block"
                  >
                    View Project →
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(project)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}