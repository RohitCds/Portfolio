"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    link: "",
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
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
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      setEditingId(null);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <ul className="space-y-4">
        {projects.map((project) => (
          <li
            key={project.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            {editingId === project.id ? (
              <div className="flex flex-col gap-2 flex-1 mr-4">
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(project.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-semibold">{project.title}</h2>
                  <p className="text-sm text-gray-600">
                    {project.description}
                  </p>
                  <p className="text-sm text-gray-500">{project.techStack}</p>
                  <a
                    href={project.link}
                    target="_blank"
                    className="text-blue-600 underline text-sm"
                  >
                    View Project
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(project)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
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