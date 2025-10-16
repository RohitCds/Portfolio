"use client";
import { FaHome, FaUser, FaTools, FaProjectDiagram, FaEnvelope, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

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
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-950 to-black text-white shadow-2xl transition-all duration-300 z-40 border-r border-gray-800 ${
        collapsed ? "w-20" : "w-52"
      }`}
    >
      {/* Toggle Button - Positioned at edge */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-6 bg-gray-800/50 backdrop-blur-sm p-2 hover:bg-gray-700 transition-all duration-200 border border-gray-700 ${
          collapsed ? "right-2" : "right-4"
        }`}
        style={{ borderRadius: collapsed ? "0.5rem" : "0.5rem" }}
        aria-label="Toggle Sidebar"
      >
        {collapsed ? (
          <FaAngleDoubleRight className="text-lg text-gray-400 hover:text-white transition-colors" />
        ) : (
          <FaAngleDoubleLeft className="text-lg text-gray-400 hover:text-white transition-colors" />
        )}
      </button>

      {/* Logo/Brand Area (optional) */}
      {!collapsed && (
        <div className="px-6 py-8 border-b border-gray-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Portfolio
          </h2>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className={`flex flex-col gap-2 px-3 ${collapsed ? "mt-16" : "mt-8"}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center gap-4 cursor-pointer transition-all duration-200 w-full ${
              collapsed ? "justify-center" : "justify-start"
            } p-3 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 group`}
            onClick={() => scrollToSection(item.id)}
          >
            <span className={`${collapsed ? "text-2xl" : "text-xl"} group-hover:scale-110 transition-transform`}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-base font-medium">{item.name}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}