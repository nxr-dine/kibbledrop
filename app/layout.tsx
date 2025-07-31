import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"

// Using system fonts to avoid Google Fonts connection issues
const inter = { className: "font-sans" }

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
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
