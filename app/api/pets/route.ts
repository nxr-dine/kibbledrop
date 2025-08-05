import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pets = await prisma.petProfile.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(pets)
  } catch (error) {
    console.error("Error fetching pets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const breed = formData.get("breed") as string
    const birthday = formData.get("birthday") as string
    const weight = parseFloat(formData.get("weight") as string)
    const healthTags = JSON.parse(formData.get("healthTags") as string || "[]")
    const imageFile = formData.get("image") as File | null

    if (!name || !type || !breed || !birthday || !weight) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Handle image upload (for now, we'll store the image data as base64)
    // In production, you'd want to upload to a service like Cloudinary, AWS S3, etc.
    let imageUrl = null
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = imageFile.type
      imageUrl = `data:${mimeType};base64,${base64}`
    }

    const pet = await prisma.petProfile.create({
      data: {
        userId: session.user.id,
        name,
        type,
        breed,
        birthday: new Date(birthday),
        weight,
        image: imageUrl,
        healthTags: healthTags || []
      }
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    console.error("Error creating pet:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 