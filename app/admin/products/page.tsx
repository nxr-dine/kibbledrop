"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  // New filtering fields
  brand?: string;
  weight?: string;
  species?: string;
  lifeStage?: string;
  productType?: string;
  foodType?: string;
  // Weight variants
  weightVariants?: Array<{
    id: string;
    weight: string;
    price: number;
    inStock: boolean;
  }>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products...");
      const response = await fetch("/api/admin/products");
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Products data received:", data.length, "products");
        setProducts(data);
      } else {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    setDeletingId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        toast({
          title: "Product Deleted",
          description: `${productName} has been deleted successfully.`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
          <CardDescription>All products in your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No products found</p>
              <Button asChild>
                <Link href="/admin/products/create">
                  Create Your First Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Pet Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="text-xs">
                          {product.petType}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {product.weightVariants && product.weightVariants.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {product.weightVariants.length} variants
                            </div>
                            <div className="text-xs text-gray-600">
                              ${Math.min(...product.weightVariants.map(v => v.price)).toFixed(2)} - 
                              ${Math.max(...product.weightVariants.map(v => v.price)).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">${product.price.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={product.featured ? "default" : "outline"}
                          className="text-xs"
                        >
                          {product.featured ? "Featured" : "Active"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
