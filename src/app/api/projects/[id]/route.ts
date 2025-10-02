import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await prisma.project.delete({ where: { id: parseInt(id) } });
    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  try {
    const updated = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        description: body.description,
        techStack: body.techStack,
        link: body.link,
      },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update project", details: String(error) },
      { status: 500 }
    );
  }
}