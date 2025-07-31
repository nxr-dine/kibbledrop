"use client"

import { useState, useMemo } from "react"
import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { products } from "@/lib/data"

interface ProductsPageProps {
  searchParams?: { category?: string }
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams?.category || "all")

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return products
    }
    return products.filter((product) => product.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pet Food Products</h1>
          <p className="text-gray-600 mt-2">Premium nutrition delivered monthly</p>
        </div>
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      <ProductGrid products={filteredProducts} />
    </div>
  )
}
