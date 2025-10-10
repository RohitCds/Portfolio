import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// --------------------
// GET: Fetch all skills (grouped by category & ordered)
// --------------------
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: "asc" },
        { order: "asc" },
      ],
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error("❌ Error fetching skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

// --------------------
// POST: Add a new skill
// --------------------
export async function POST(req: Request) {
  try {
    const { name, category } = await req.json();

    // Basic validation
    if (!name || !category || typeof name !== "string" || typeof category !== "string") {
      return NextResponse.json(
        { error: "Invalid input. 'name' and 'category' are required strings." },
        { status: 400 }
      );
    }

    // Determine next order number within this category
    const count = await prisma.skill.count({
      where: { category },
    });

    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        order: count,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating skill:", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
