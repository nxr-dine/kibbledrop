import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function checkAdminRole(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    
    return user?.role === "admin"
  } catch (error) {
    console.error("Error checking admin role:", error)
    return false
  }
}

export function requireAdminRole() {
  return async (session: any) => {
    if (!session?.user?.id) {
      return false
    }
    
    return await checkAdminRole(session.user.id)
  }
}
