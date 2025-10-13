"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string;
  link: string;
}

export default function EditProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    link: "",
  });
  const router = useRouter();

  // Fetch projects on load
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data: Project[]) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  const handleAddClick = () => {
    setFormData({ title: "", description: "", techStack: "", link: "" });
    setAdding(true);
  };

  const handleEditClick = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      link: project.link,
    });
    setEditingProject(project);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.techStack || !formData.link) {
      alert("All fields are required");
      return;
    }

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const newProject = await res.json();
      setProjects([newProject, ...projects]);
      setFormData({ title: "", description: "", techStack: "", link: "" });
      setAdding(false);
    } else {
      alert("Failed to save project");
    }
  };

  const handleUpdate = async () => {
    if (!editingProject) return;

    const res = await fetch(`/api/projects/${editingProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const updated = await res.json();
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProject(null);
      setFormData({ title: "", description: "", techStack: "", link: "" });
    } else {
      alert("Failed to update project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProjects(projects.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete project");
    }
  };

  const handleClose = () => {
    setAdding(false);
    setEditingProject(null);
    setFormData({ title: "", description: "", techStack: "", link: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex flex-col items-center py-12 px-6">
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-wide">
        Edit Projects
      </h1>

      <motion.div
        className="w-full max-w-5xl space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Project List */}
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-3">{project.description}</p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong>Tech Stack:</strong> {project.techStack}
                </p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  {project.link}
                </a>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditClick(project)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add/Edit Form */}
        <AnimatePresence>
          {(adding || editingProject) && (
            <motion.div
              className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-xl font-bold mb-2">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>

              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Project Title"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Project Description"
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                value={formData.techStack}
                onChange={(e) =>
                  setFormData({ ...formData, techStack: e.target.value })
                }
                placeholder="Tech Stack (e.g., React, Node.js, PostgreSQL)"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="Project Link (GitHub, Live Demo, etc.)"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingProject ? handleUpdate : handleSave}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  {editingProject ? "Update" : "Save"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add & Done buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleAddClick}
            disabled={adding || editingProject !== null}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              adding || editingProject
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            ➕ Add Project
          </button>

          {!adding && !editingProject && (
            <motion.button
              onClick={() => router.push("/")}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
              whileHover={{ scale: 1.05 }}
            >
              Done
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}