import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("Full session object:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      return NextResponse.json({
        error: "No session or user ID",
        session: session,
      });
    }

    // Check user in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true },
    });

    console.log("User from database:", user);

    return NextResponse.json({
      session: session,
      userFromDB: user,
      sessionUserId: session.user.id,
      userRole: user?.role,
    });
  } catch (error) {
    console.error("Debug session error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
