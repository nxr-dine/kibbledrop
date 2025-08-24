import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TradesafeConfigChecker } from "@/lib/tradesafe-checker";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to check configuration
    // You might want to add admin role checking here

    const configStatus = TradesafeConfigChecker.checkConfiguration();
    
    return NextResponse.json({
      success: true,
      status: configStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking TradeSafe configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
