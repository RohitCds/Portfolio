"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
      {/* Profile Image */}
      <div className="absolute top-1/4 transform -translate-y-1/2">
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg">
          <Image
            src="/Portfolio Pic.jpg"
            alt="Rohit Shroff"
            width={192}
            height={192}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Text */}
      <div className="mt-0 text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-50 to-gray-1500 bg-clip-text text-transparent bg-[length:200%_auto]">
          Hi, I am Rohit Shroff
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          AI Engineer • Full-Stack ML Developer • Problem Solver
        </p>

        {/* Button */}
        <div className="mt-8">
          <Link
            href="/projects"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            View My Projects
          </Link>
        </div>
      </div>
    </main>
  );
}