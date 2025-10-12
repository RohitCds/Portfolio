"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Skill {
  id: number;
  name: string;
  category: string;
}

export default function EditSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryType, setCategoryType] = useState<"new" | "existing">("new");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const router = useRouter();

  // Fetch skills on load
  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data: Skill[]) => {
        setSkills(data);
        const categories = Array.from(new Set(data.map((s) => s.category)));
        setExistingCategories(categories);
      })
      .catch((err) => console.error("Failed to fetch skills:", err));
  }, []);

  // Group skills by category
  const groupedSkills = skills.reduce((acc: Record<string, Skill[]>, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const handleAddClick = () => setAdding(true);

  const handleSave = async () => {
    const categoryToUse =
      categoryType === "new" ? newCategory.trim() : newCategory;

    if (newSkill.trim() && categoryToUse) {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkill,
          category: categoryToUse,
        }),
      });

      if (res.ok) {
        const savedSkill = await res.json();
        setSkills([...skills, savedSkill]);
        setNewSkill("");
        setNewCategory("");
        setCategoryType("new");
        setAdding(false);

        if (!existingCategories.includes(savedSkill.category)) {
          setExistingCategories([...existingCategories, savedSkill.category]);
        }
      } else {
        alert("Failed to save skill. Please try again.");
      }
    }
  };

  const handleClose = () => {
    setNewSkill("");
    setNewCategory("");
    setCategoryType("new");
    setAdding(false);
    setEditingSkill(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    const res = await fetch("/api/skills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setSkills(skills.filter((s) => s.id !== id));
    } else {
      alert("Failed to delete skill.");
    }
  };

  const handleUpdate = async () => {
    if (!editingSkill) return;

    const res = await fetch("/api/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingSkill),
    });

    if (res.ok) {
      const updated = await res.json();
      setSkills(skills.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSkill(null);
    } else {
      alert("Failed to update skill.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex flex-col items-center py-12 px-6">
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-wide">
        Edit Skills
      </h1>

      <motion.div
        className="w-full max-w-3xl space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <motion.div
            key={category}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              {category}
            </h2>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  layout
                  className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-sm shadow-sm"
                >
                  {editingSkill?.id === skill.id ? (
                    <>
                      <input
                        type="text"
                        value={editingSkill.name}
                        onChange={(e) =>
                          setEditingSkill({
                            ...editingSkill,
                            name: e.target.value,
                          })
                        }
                        className="bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none"
                      />
                      <select
                        value={editingSkill.category}
                        onChange={(e) =>
                          setEditingSkill({
                            ...editingSkill,
                            category: e.target.value,
                          })
                        }
                        className="bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none"
                      >
                        {existingCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSkill(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-md text-xs"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{skill.name}</span>
                      <button
                        onClick={() => setEditingSkill(skill)}
                        className="text-yellow-400 hover:text-yellow-300 text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Add new skill section */}
        <AnimatePresence>
          {adding && (
            <motion.div
              key="newSkill"
              className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <select
                value={categoryType}
                onChange={(e) =>
                  setCategoryType(e.target.value as "new" | "existing")
                }
                className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New Category</option>
                <option value="existing">Existing Category</option>
              </select>

              {categoryType === "new" ? (
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category (e.g. Frontend, AI/ML)"
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select existing category</option>
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter new skill (e.g. Next.js)"
                className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add & Done buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleAddClick}
            disabled={adding}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              adding
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            ➕ Add Skill
          </button>

          {!adding && !editingSkill && (
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
