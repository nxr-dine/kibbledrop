import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("=== SESSION TEST ===");
    console.log("Session:", session);
    console.log("User ID:", session?.user?.id);
    console.log("User Email:", session?.user?.email);
    console.log("User Name:", session?.user?.name);
    console.log("User Role:", session?.user?.role);
    console.log("===================");

    return NextResponse.json({
      isAuthenticated: !!session,
      user: session?.user || null,
      sessionData: session,
    });
  } catch (error) {
    console.error("Session test error:", error);
    return NextResponse.json({ error: "Session test failed" }, { status: 500 });
  }
}
