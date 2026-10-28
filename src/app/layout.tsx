import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

// Fonts are bundled (latin variable woff2 from Google Fonts, SIL OFL) instead of fetched at build time:
// next/font/google in Next 15.5 crashes when Google serves a font URL without a file extension.
const geistSans = localFont({
  src: "./fonts/Geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-latin.woff2",
  variable: "--font-display",
  weight: "300 700",
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
