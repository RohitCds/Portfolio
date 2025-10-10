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
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  // Fetch existing skills
  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => setSkills(data));
  }, []);

  // Group skills by category
  const groupedSkills = skills.reduce((acc: Record<string, Skill[]>, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const handleAddClick = () => setAdding(true);

  const handleSave = async () => {
    if (newSkill.trim() && newCategory.trim()) {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkill,
          category: newCategory,
        }),
      });

      if (res.ok) {
        const savedSkill = await res.json();
        setSkills([...skills, savedSkill]);
        setNewSkill("");
        setNewCategory("");
        setAdding(false);
      } else {
        alert("Failed to save skill. Please try again.");
      }
    }
  };

  const handleClose = () => {
    setNewSkill("");
    setNewCategory("");
    setAdding(false);
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
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">{category}</h2>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-gray-800 px-3 py-1 rounded-full text-sm shadow-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {adding && (
            <motion.div
              key="newSkill"
              className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category (e.g. Frontend, Backend, AI/ML)"
                className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

          {!adding && (
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
