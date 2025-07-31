import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/hooks/use-toast"
import { AuthProvider } from "@/contexts/auth-context" // Import AuthProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KibbleDrop - Premium Pet Food Delivery",
  description: "Fresh, healthy pet food delivered to your door",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {" "}
          {/* Wrap with AuthProvider */}
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50">{children}</main>
              <Toaster />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
