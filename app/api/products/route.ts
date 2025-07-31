import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const petType = searchParams.get("petType")
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    const where: any = {}

    if (petType) {
      where.petType = petType
    }

    if (category) {
      where.category = category
    }

    if (featured === "true") {
      where.featured = true
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 