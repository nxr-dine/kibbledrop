import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { checkAdminRole } from "@/lib/utils"

// GET - Get all products (admin view)
export async function GET() {
  try {
    console.log('Products API called')
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.id)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id)
    console.log('Is admin:', isAdmin, 'for user ID:', session.user.id)
    if (!isAdmin) {
      console.log('User is not admin')
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log('Found products:', products.length)
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, category, petType, image, featured } = body

    // Validation
    if (!name || !description || !price || !category || !petType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        petType,
        image: image || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(name)}`,
        featured: featured || false
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 