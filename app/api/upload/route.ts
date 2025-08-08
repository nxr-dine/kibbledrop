import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkAdminRole } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/upload called ===");
    const session = await getServerSession(authOptions);
    console.log("Session user:", session?.user);
    console.log("Session user ID:", session?.user?.id);

    if (!session?.user) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role for product uploads
    console.log("🔍 Checking admin role for user ID:", session.user.id);
    const isAdmin = await checkAdminRole(session.user.id);
    console.log("✅ Is admin:", isAdmin);
    
    if (!isAdmin) {
      console.log("❌ User is not admin");
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit for Vercel)
    const maxSize = 2 * 1024 * 1024; // 2MB for better performance on Vercel
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 2MB.",
        },
        { status: 400 }
      );
    }

    // Convert to base64 for Vercel compatibility
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `product_${timestamp}.${fileExtension}`;

    // Create data URL for immediate use
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      url: dataUrl,
      filename: filename,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
