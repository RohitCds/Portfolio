import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
}