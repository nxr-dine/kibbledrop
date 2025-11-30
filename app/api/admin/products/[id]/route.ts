import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkAdminRole } from "@/lib/utils";

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        weightVariants: true,
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

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== PUT /api/admin/products/[id] called ===");
    console.log("Product ID:", params.id);
    
    const session = await getServerSession(authOptions);
    console.log("Session user:", session?.user);

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
    console.log("Request body:", body);
    
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
      weightVariants,
      brand,
      weight,
      species,
      lifeStage,
      productType,
      foodType,
      keyFeatures,
    } = body;

    // Validation
    if (!name || !description || !price || !category || !petType) {
      console.log("❌ Missing required fields:", { name, description, price, category, petType });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if product exists
    console.log("🔍 Checking if product exists...");
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      console.log("❌ Product not found");
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.log("✅ Product found:", existingProduct.name);

    // Update product with weight variants in a transaction
    console.log("🔄 Updating product...");
    const result = await prisma.$transaction(async (tx) => {
      // Update the main product
      const product = await tx.product.update({
        where: { id: params.id },
        data: {
          name,
          description,
          price: parseFloat(price),
          category,
          petType,
          image: image || existingProduct.image,
          featured: featured || false,
          // Nutrition facts - only set if provided, otherwise null
          protein: protein || null,
          fat: fat || null,
          fiber: fiber || null,
          moisture: moisture || null,
          calories: calories || null,
          omega6: omega6 || null,
          ingredients: ingredients || null,
          // Additional fields
          brand: brand || null,
          weight: weight || null,
          species: species || null,
          lifeStage: lifeStage || null,
          productType: productType || null,
          foodType: foodType || null,
          keyFeatures: keyFeatures || null,
        },
      });

      // Handle weight variants if provided
      if (weightVariants && Array.isArray(weightVariants)) {
        // Delete existing weight variants
        await tx.productWeightVariant.deleteMany({
          where: { productId: params.id },
        });

        // Create new weight variants
        if (weightVariants.length > 0) {
          for (const variant of weightVariants) {
            if (variant.weight && variant.price) {
              await tx.$executeRaw`
                INSERT INTO "ProductWeightVariant" (id, "productId", weight, price, "inStock", "createdAt", "updatedAt")
                VALUES (gen_random_uuid()::text, ${product.id}, ${variant.weight}, ${parseFloat(variant.price)}, true, NOW(), NOW())
              `;
            }
          }
        }
      }

      return product;
    });

    console.log("✅ Product updated successfully:", result.name);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is used in any ACTIVE subscriptions
    const activeSubscriptionItems = await prisma.subscriptionItem.findMany({
      where: { 
        productId: params.id,
        subscription: {
          status: "active"
        }
      },
      include: {
        subscription: true
      }
    });

    if (activeSubscriptionItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product that is used in active subscriptions" },
        { status: 400 }
      );
    }

    // Delete product
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
