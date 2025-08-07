import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productData = await prisma.$queryRaw`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', wv.id,
              'weight', wv.weight,
              'price', wv.price,
              'inStock', wv."inStock"
            )
          ) FILTER (WHERE wv.id IS NOT NULL),
          '[]'::json
        ) as "weightVariants"
      FROM "Product" p
      LEFT JOIN "ProductWeightVariant" wv ON p.id = wv."productId"
      WHERE p.id = ${params.id}
      GROUP BY p.id
    ` as any[];

    if (!productData || productData.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productData[0];
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
