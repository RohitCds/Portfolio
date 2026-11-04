import type { Metadata } from "next";
import DiffusionLab from "@/components/space/DiffusionLab";
import { minLoad } from "@/lib/minLoad";

// Rendered per request so the minimum load time (and the launch loader) applies every visit
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diffusion, step by step",
  description: "How image generators turn static into a picture, in six short steps with runnable code on GitHub.",
};

export default async function DiffusionLabPage() {
  await minLoad();
  return <DiffusionLab />;
}
