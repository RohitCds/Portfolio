"use client";

import { FaHome, FaUser, FaTools, FaProjectDiagram, FaEnvelope } from "react-icons/fa";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    { name: "Home", icon: <FaHome />, id: "home" },
    { name: "About", icon: <FaUser />, id: "about" },
    { name: "Skills", icon: <FaTools />, id: "skills" },
    { name: "Projects", icon: <FaProjectDiagram />, id: "projects" },
    { name: "Contact", icon: <FaEnvelope />, id: "contact" },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-black text-white shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-52"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="m-4 p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        {collapsed ? "➡️" : "⬅️"}
      </button>

      <nav className="flex flex-col mt-10 gap-6 items-center">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 cursor-pointer hover:text-blue-500"
            onClick={() => scrollToSection(item.id)}
          >
            <span className={`${collapsed ? "text-3xl" : "text-xl"}`}>{item.icon}</span>
            {!collapsed && <span className="text-lg">{item.name}</span>}
          </div>
        ))}
      </nav>
    </div>
  );
}