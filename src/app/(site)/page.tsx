import Hero from "@/components/space/Hero";
import { minLoad } from "@/lib/minLoad";

// Rendered per request so the minimum load time (and the launch loader) applies every visit
export const dynamic = "force-dynamic";

export default async function HomePage() {
  await minLoad();
  return <Hero />;
}
