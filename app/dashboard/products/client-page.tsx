"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilter } from "@/components/product-filter";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  petType: string;
  image: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  // New filtering fields
  brand?: string | null;
  weight?: string | null;
  species?: string | null;
  lifeStage?: string | null;
  productType?: string | null;
  foodType?: string | null;
}

interface ClientProductsPageProps {
  initialProducts: Product[];
}

export default function ClientProductsPage({
  initialProducts,
}: ClientProductsPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const currentFilters = {
    category: searchParams.get("category") || undefined,
    petType: searchParams.get("petType") || undefined,
    brand: searchParams.get("brand") || undefined,
    weight: searchParams.get("weight") || undefined,
    species:
      searchParams.get("species") || searchParams.get("petType") || undefined,
    lifeStage: searchParams.get("lifeStage") || undefined,
    productType: searchParams.get("productType") || undefined,
    foodType: searchParams.get("foodType") || undefined,
  };

  const handleFiltersChange = async (filters: any) => {
    setLoading(true);

    const params = new URLSearchParams();

    // Add filters to URL params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value as string);
      }
    });

    router.push(`/dashboard/products?${params.toString()}`);

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Pet Food Products
        </h1>
        <p className="text-gray-600">Premium nutrition delivered monthly</p>
      </div>

      <ProductFilter
        filters={currentFilters}
        onFiltersChange={handleFiltersChange}
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
