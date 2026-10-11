import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
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

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Rohit Shroff", template: "%s · Rohit Shroff" },
  description: "AI Engineer • Full-Stack ML Developer • Problem Solver",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}>
        <Providers>
          {children}

          {/* Footer with hidden admin login link */}
          <footer className="relative z-10 border-t border-line py-8 text-center font-mono text-xs text-dim">
            © {new Date().getFullYear()} Rohit Shroff · transmitted from Earth
            <a
              href="/admin-login-9271"
              className="ml-2 opacity-30 transition-opacity hover:opacity-100"
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
