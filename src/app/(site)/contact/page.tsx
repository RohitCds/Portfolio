import type { Metadata } from "next";
import Contact from "@/components/space/Contact";
import { minLoad } from "@/lib/minLoad";

// Rendered per request so the minimum load time (and the launch loader) applies every visit
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  await minLoad();
  return <Contact />;
}
