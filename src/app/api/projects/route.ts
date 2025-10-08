import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";



export async function GET() {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try{
        const { title, description, techStack, link } = await request.json();
        if (!title || !description || !techStack || !link) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const newProject = await prisma.project.create({
            data: { title, description, techStack, link },
        });
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", details: String(error) }, { status: 500 });
    }
}


