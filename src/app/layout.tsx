import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rohit Shroff",
  description: "AI Engineer • Full-Stack ML Developer • Problem Solver",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          
          {/* Footer with hidden admin login link */}
          <footer className="text-center text-gray-500 text-sm py-6 bg-black">
            © {new Date().getFullYear()} Rohit Shroff
            <a
              href="/admin-login-9271"  // Changed from "/login"
              className="ml-2 text-xs opacity-30 hover:opacity-100 transition-opacity"
              title="Admin"
            >
              ⚙️
            </a>
          </footer>
        </Providers>
        
        <Toaster position="top-right" />
      </body>
    </html>
  );
}