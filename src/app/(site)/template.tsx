"use client";

import { motion } from "framer-motion";

// Re-mounts on every navigation, giving each page a short fade-in
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
