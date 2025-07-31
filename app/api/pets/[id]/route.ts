import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, breed, age, weight, healthTags } = body

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

    const updatedPet = await prisma.petProfile.update({
      where: {
        id: params.id
      },
      data: {
        name,
        type,
        breed,
        age: parseInt(age),
        weight: parseFloat(weight),
        healthTags: healthTags || []
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
    const session = await getServerSession()
    
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