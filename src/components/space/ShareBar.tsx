"use client";

import toast from "react-hot-toast";
import { FaLinkedin } from "react-icons/fa";
import { HiOutlineLink } from "react-icons/hi";

// LinkedIn share + copy link for the current page
export default function ShareBar({ title, compact = false }: { title: string; compact?: boolean }) {
  const shareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href.split("#")[0]);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer,width=600,height=640");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareLinkedIn}
        aria-label={`Share "${title}" on LinkedIn`}
        className={`inline-flex items-center gap-2 rounded-full bg-[#0a66c2] font-medium text-white transition hover:brightness-110 ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
      >
        <FaLinkedin /> {compact ? "Share" : "Share on LinkedIn"}
      </button>
      <button
        onClick={copy}
        aria-label="Copy link"
        className={`inline-flex items-center gap-2 rounded-full border border-line text-star transition hover:border-mint/50 hover:text-mint ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
      >
        <HiOutlineLink /> {compact ? "" : "Copy link"}
      </button>
    </div>
  );
}
