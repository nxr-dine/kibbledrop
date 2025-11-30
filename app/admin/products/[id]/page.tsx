"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { formatZAR } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  petType: string;
  image: string;
  featured: boolean;
  brand?: string;
  weight?: string;
  species?: string;
  lifeStage?: string;
  productType?: string;
  foodType?: string;
  protein?: string;
  fat?: string;
  fiber?: string;
  moisture?: string;
  calories?: string;
  omega6?: string;
  ingredients?: string;
  keyFeatures?: string;
  weightVariants?: Array<{
    id: string;
    weight: string;
    price: number;
    inStock: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ViewProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Button asChild>
            <Link href="/admin/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">Product Details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Description
              </label>
              <p className="text-gray-700">{product.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Price</label>
                <p className="text-xl font-bold text-orange-600">
                  {formatZAR(product.price)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <Badge variant="outline" className="mt-1">
                  {product.category}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Pet Type</label>
                <Badge variant="secondary" className="mt-1">
                  {product.petType}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge
                  variant={product.featured ? "default" : "outline"}
                  className="mt-1"
                >
                  {product.featured ? "Featured" : "Active"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.brand && (
              <div>
                <label className="text-sm font-medium text-gray-500">Brand</label>
                <p>{product.brand}</p>
              </div>
            )}
            {product.lifeStage && (
              <div>
                <label className="text-sm font-medium text-gray-500">Life Stage</label>
                <p>{product.lifeStage}</p>
              </div>
            )}
            {product.productType && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Product Type
                </label>
                <p>{product.productType}</p>
              </div>
            )}
            {product.foodType && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Food Type
                </label>
                <p>{product.foodType}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {product.weightVariants && product.weightVariants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weight Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.weightVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <span className="font-medium">{variant.weight}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-orange-600 font-semibold">
                        {formatZAR(variant.price)}
                      </span>
                      <Badge
                        variant={variant.inStock ? "default" : "destructive"}
                      >
                        {variant.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(product.protein ||
          product.fat ||
          product.fiber ||
          product.moisture ||
          product.calories ||
          product.omega6) && (
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {product.protein && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Protein
                    </label>
                    <p>{product.protein}</p>
                  </div>
                )}
                {product.fat && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fat</label>
                    <p>{product.fat}</p>
                  </div>
                )}
                {product.fiber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Fiber
                    </label>
                    <p>{product.fiber}</p>
                  </div>
                )}
                {product.moisture && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Moisture
                    </label>
                    <p>{product.moisture}</p>
                  </div>
                )}
                {product.calories && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Calories
                    </label>
                    <p>{product.calories}</p>
                  </div>
                )}
                {product.omega6 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Omega-6
                    </label>
                    <p>{product.omega6}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {product.ingredients && (
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.ingredients}
              </p>
            </CardContent>
          </Card>
        )}

        {product.keyFeatures && (
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.keyFeatures
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>{feature.trim()}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

