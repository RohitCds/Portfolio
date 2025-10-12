import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

/* -------------------- GET: Fetch all skills -------------------- */
export async function GET() {
  const skills = await prisma.skill.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(skills);
}

/* -------------------- POST: Add a new skill -------------------- */
export async function POST(req: Request) {
  const { name, category } = await req.json();

  if (!name || !category) {
    return NextResponse.json(
      { error: "Name and category are required" },
      { status: 400 }
    );
  }

  const count = await prisma.skill.count();
  const skill = await prisma.skill.create({
    data: { name, category, order: count },
  });

  return NextResponse.json(skill);
}

/* -------------------- PUT: Update an existing skill -------------------- */
export async function PUT(req: Request) {
  const { id, name, category } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
  }

  const existing = await prisma.skill.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const updated = await prisma.skill.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      category: category ?? existing.category,
    },
  });

  return NextResponse.json(updated);
}

/* -------------------- DELETE: Remove a skill by ID -------------------- */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
  }

  const existing = await prisma.skill.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  await prisma.skill.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

/* -------------------- GET_CATEGORIES: Fetch unique categories -------------------- */
export async function GET_CATEGORIES() {
  const categories = await prisma.skill.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return NextResponse.json(categories.map((c) => c.category));
}
