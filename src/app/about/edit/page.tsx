"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditAboutPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing About Me content from the API
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("/api/about");
        if (!res.ok) throw new Error("Failed to fetch About Me");
        const data = await res.json();
        setText(data?.content || "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load About Me content.");
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) throw new Error("Failed to save About Me");

      toast.success("About Me updated successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save About Me content.");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
      <div className="bg-gray-800 shadow-lg p-8 rounded-xl w-full max-w-3xl flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white text-center">Edit About Me</h1>
        <textarea
          className="w-full h-72 p-4 rounded-lg resize-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
