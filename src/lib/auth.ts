import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Guard for mutating API routes: returns a 401 response when nobody is signed in, otherwise null
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
