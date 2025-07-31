"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { useRouter, useSearchParams } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  petType: string
  image: string
  featured: boolean
  createdAt: string
  updatedAt: string
}

interface ClientProductsPageProps {
  initialProducts: Product[]
}

export default function ClientProductsPage({ initialProducts }: ClientProductsPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = async (category: string) => {
    setLoading(true)
    
    const params = new URLSearchParams(searchParams)
    if (category === 'all') {
      params.delete('petType')
      params.delete('category')
    } else if (category === 'Dog' || category === 'Cat') {
      params.set('petType', category)
      params.delete('category')
    } else {
      params.set('category', category)
      params.delete('petType')
    }
    
    router.push(`/products?${params.toString()}`)
    
    try {
      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pet Food Products</h1>
          <p className="text-gray-600 mt-2">Premium nutrition delivered monthly</p>
        </div>
        <CategoryFilter 
          selectedCategory={searchParams.get('petType') || searchParams.get('category') || "all"} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
} 