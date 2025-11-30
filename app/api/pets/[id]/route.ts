import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
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
    const activityLevel = formData.get("activityLevel") ? parseInt(formData.get("activityLevel") as string) : null
    const feedFrequencyPerDay = formData.get("feedFrequencyPerDay") ? parseInt(formData.get("feedFrequencyPerDay") as string) : null
    const imageFile = formData.get("image") as File | null
    const vaccineCardFile = formData.get("vaccineCard") as File | null

    // Verify the pet belongs to the user
    const existingPet = await prisma.petProfile.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // Handle image upload (for now, we'll store the image data as base64)
    // In production, you'd want to upload to a service like Cloudinary, AWS S3, etc.
    let imageUrl = existingPet.image // Keep existing image if no new one
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = imageFile.type
      imageUrl = `data:${mimeType};base64,${base64}`
    }

    // Handle vaccine card upload
    let vaccineCardUrl = existingPet.vaccineCardUrl // Keep existing vaccine card if no new one
    if (vaccineCardFile) {
      const bytes = await vaccineCardFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = vaccineCardFile.type
      vaccineCardUrl = `data:${mimeType};base64,${base64}`
    }

    const updatedPet = await prisma.petProfile.update({
      where: {
        id: params.id
      },
      data: {
        name,
        type,
        breed,
        birthday: new Date(birthday),
        weight,
        image: imageUrl,
        vaccineCardUrl: vaccineCardUrl,
        healthTags: healthTags || [],
        activityLevel: activityLevel || null,
        feedFrequencyPerDay: feedFrequencyPerDay || null
      }
    })

    return NextResponse.json(updatedPet)
  } catch (error) {
    console.error("Error updating pet:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the pet belongs to the user
    const existingPet = await prisma.petProfile.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    await prisma.petProfile.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Pet deleted successfully" })
  } catch (error) {
    console.error("Error deleting pet:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 