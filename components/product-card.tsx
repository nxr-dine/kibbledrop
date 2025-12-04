"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
      <Link href={`/products/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            />
            <Badge
              className="absolute top-2 right-2 capitalize"
              variant={product.petType === "Dog" ? "default" : "secondary"}
            >
              {product.petType}
            </Badge>
            {product.featured && (
              <Badge className="absolute top-2 left-2 bg-orange-600 text-white">
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4">
          <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </CardTitle>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {product.description}
          </p>
          <div className="mt-auto">
            <p className="text-2xl font-bold text-orange-600">
              {formatZAR(product.price)}
            </p>
            <p className="text-sm text-gray-500">per item</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
