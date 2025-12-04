import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAdminRole } from "@/lib/utils";

// GET - Get all products (admin view)
export async function GET() {
  try {
    console.log("Products API called");
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.id);

    if (!session?.user) {
      console.log("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id);
    console.log("Is admin:", isAdmin, "for user ID:", session.user.id);
    if (!isAdmin) {
      console.log("User is not admin");
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const products = (await prisma.$queryRaw`
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
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
    `) as any[];

    console.log("Found products:", products.length);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/admin/products called ===");
    const session = await getServerSession(authOptions);
    console.log("Session user:", session?.user);
    console.log("Session user ID:", session?.user?.id);

    if (!session?.user) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
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

    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      petType,
      image,
      featured,
      brand,
      weight,
      species,
      lifeStage,
      productType,
      foodType,
      protein,
      fat,
      fiber,
      moisture,
      calories,
      omega6,
      ingredients,
      weightVariants,
    } = body;

    // Validation
    if (!name || !description || !price || !category || !petType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate weight variants
    if (
      weightVariants &&
      (!Array.isArray(weightVariants) || weightVariants.length === 0)
    ) {
      return NextResponse.json(
        { error: "At least one weight variant is required" },
        { status: 400 }
      );
    }

    // Create product with weight variants in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the main product
      const product = await tx.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          category,
          petType,
          image:
            image ||
            `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(
              name
            )}`,
          featured: featured || false,
          // New filtering fields
          brand,
          weight,
          species,
          lifeStage,
          productType,
          foodType,
          // Nutrition facts (only set if provided)
          protein: protein || null,
          fat: fat || null,
          fiber: fiber || null,
          moisture: moisture || null,
          calories: calories || null,
          omega6: omega6 || null,
          ingredients: ingredients || null,
          keyFeatures: body.keyFeatures || null,
        },
      });

      // Create weight variants if provided using raw SQL for now
      if (weightVariants && weightVariants.length > 0) {
        for (const variant of weightVariants) {
          await tx.$executeRaw`
            INSERT INTO "ProductWeightVariant" (id, "productId", weight, price, "inStock", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, ${product.id}, ${
            variant.weight
          }, ${parseFloat(variant.price)}, true, NOW(), NOW())
          `;
        }
      }

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
