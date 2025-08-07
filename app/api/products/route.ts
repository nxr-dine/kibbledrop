import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petType = searchParams.get("petType");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const brand = searchParams.get("brand");
    const weight = searchParams.get("weight");
    const species = searchParams.get("species");
    const lifeStage = searchParams.get("lifeStage");
    const productType = searchParams.get("productType");
    const foodType = searchParams.get("foodType");

    const where: any = {};

    if (petType) {
      where.petType = petType;
    }

    if (category) {
      where.category = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (brand) {
      where.brand = brand;
    }

    if (weight) {
      // Handle weight ranges
      switch (weight) {
        case "0-500g":
          where.weight = { contains: "g", not: { contains: "kg" } };
          break;
        case "500g-1kg":
          where.OR = [
            { weight: { contains: "500g" } },
            { weight: { contains: "1kg" } },
          ];
          break;
        case "1-2kg":
          where.OR = [
            { weight: { contains: "1kg" } },
            { weight: { contains: "2kg" } },
          ];
          break;
        case "2-5kg":
          where.OR = [
            { weight: { contains: "2kg" } },
            { weight: { contains: "3kg" } },
            { weight: { contains: "4kg" } },
            { weight: { contains: "5kg" } },
          ];
          break;
        case "5kg+":
          where.OR = [
            { weight: { contains: "5kg" } },
            { weight: { contains: "6kg" } },
            { weight: { contains: "7kg" } },
            { weight: { contains: "8kg" } },
            { weight: { contains: "9kg" } },
            { weight: { contains: "10kg" } },
          ];
          break;
        default:
          where.weight = weight;
      }
    }

    if (species) {
      where.species = species;
    }

    if (lifeStage) {
      where.lifeStage = lifeStage;
    }

    if (productType) {
      where.productType = productType;
    }

    if (foodType) {
      where.foodType = foodType;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !petType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        petType,
        image: image || "/placeholder.svg",
        featured: Boolean(featured),
        brand,
        weight,
        species: species || petType, // Default species to petType if not provided
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
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
