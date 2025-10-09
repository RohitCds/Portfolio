import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma"; // adjust path if needed

const prisma = new PrismaClient();

// GET: fetch About Me
export async function GET() {
  const about = await prisma.aboutMe.findFirst();
  return NextResponse.json({ content: about?.content || "" });
}

// PUT: update About Me (admin only)
export async function PUT(req: Request) {
  const body = await req.json();
  const { content } = body;

  // Optional: add auth check if needed
  const updated = await prisma.aboutMe.upsert({
    where: { id: 1 }, // assuming single row with id 1
    update: { content },
    create: { content },
  });

  return NextResponse.json(updated);
}
