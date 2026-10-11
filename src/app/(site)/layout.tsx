import Starfield from "@/components/space/Starfield";
import Nav from "@/components/space/Nav";

// Shared shell for the public pages; the starfield and nav persist across navigation
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <Starfield />
      <Nav />
      <main className="relative z-10 min-h-screen">{children}</main>
    </div>
  );
}
