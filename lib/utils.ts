import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function checkAdminRole(userId: string) {
  try {
    console.log("🔍 checkAdminRole: Looking up user with ID:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    console.log("🔍 checkAdminRole: Found user:", user);
    const isAdmin = user?.role === "admin";
    console.log("🔍 checkAdminRole: Is admin?", isAdmin);

    return isAdmin;
  } catch (error) {
    console.error("❌ Error checking admin role:", error);
    return false;
  }
}

export function requireAdminRole() {
  return async (session: any) => {
    if (!session?.user?.id) {
      return false;
    }

    return await checkAdminRole(session.user.id);
  };
}

export function formatDate(date: Date | string) {
  if (typeof date === "string") {
    date = new Date(date);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
