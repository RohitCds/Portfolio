"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      toast.success("Welcome back, Rohit!");
      router.push("/");
    } else {
      toast.error("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-8 rounded-lg w-96 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-800">Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-2 rounded text-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-2 rounded text-gray-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}