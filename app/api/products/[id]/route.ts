import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      petType,
      image,
      featured,
      protein,
      fat,
      fiber,
      moisture,
      calories,
      omega6,
      ingredients,
      feedingGuideAdult,
      feedingGuidePuppy,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !petType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        petType,
        image: image || "/placeholder.svg",
        featured: Boolean(featured),
        protein,
        fat,
        fiber,
        moisture,
        calories,
        omega6,
        ingredients,
        feedingGuideAdult,
        feedingGuidePuppy,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
