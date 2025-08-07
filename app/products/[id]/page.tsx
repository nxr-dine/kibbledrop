"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Heart,
  ShoppingBag,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Award,
  ArrowLeft,
  Minus,
  Plus,
  Package,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
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
  updatedAt: string;
  // New filtering fields
  brand?: string;
  weight?: string;
  species?: string;
  lifeStage?: string;
  productType?: string;
  foodType?: string;
  // Nutrition Facts
  protein?: string;
  fat?: string;
  fiber?: string;
  moisture?: string;
  calories?: string;
  omega6?: string;
  // Ingredients
  ingredients?: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { dispatch } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Define available weight options based on product type
  const getWeightOptions = (product: Product) => {
    const baseWeights = [];
    
    if (product.productType?.includes("Treat")) {
      baseWeights.push(
        { value: "300g", label: "300g - $" + product.price.toFixed(2), priceMultiplier: 1 },
        { value: "500g", label: "500g - $" + (product.price * 1.6).toFixed(2), priceMultiplier: 1.6 },
        { value: "1kg", label: "1kg - $" + (product.price * 2.8).toFixed(2), priceMultiplier: 2.8 }
      );
    } else if (product.productType?.includes("Food")) {
      baseWeights.push(
        { value: "1kg", label: "1kg - $" + product.price.toFixed(2), priceMultiplier: 1 },
        { value: "2kg", label: "2kg - $" + (product.price * 1.8).toFixed(2), priceMultiplier: 1.8 },
        { value: "5kg", label: "5kg - $" + (product.price * 4.2).toFixed(2), priceMultiplier: 4.2 },
        { value: "10kg", label: "10kg - $" + (product.price * 7.8).toFixed(2), priceMultiplier: 7.8 },
        { value: "20kg", label: "20kg - $" + (product.price * 14.5).toFixed(2), priceMultiplier: 14.5 }
      );
    } else if (product.productType?.includes("Litter")) {
      baseWeights.push(
        { value: "5kg", label: "5kg - $" + product.price.toFixed(2), priceMultiplier: 1 },
        { value: "10kg", label: "10kg - $" + (product.price * 1.7).toFixed(2), priceMultiplier: 1.7 },
        { value: "20kg", label: "20kg - $" + (product.price * 3.2).toFixed(2), priceMultiplier: 3.2 }
      );
    } else {
      // Default for other products
      baseWeights.push(
        { value: "Regular", label: "Regular Size - $" + product.price.toFixed(2), priceMultiplier: 1 }
      );
    }
    
    return baseWeights;
  };

  const weightOptions = product ? getWeightOptions(product) : [];
  const selectedWeightOption = weightOptions.find(option => option.value === selectedWeight);
  const currentPrice = selectedWeightOption ? product!.price * selectedWeightOption.priceMultiplier : product?.price || 0;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const productData = await response.json();
        setProduct(productData);
        
        // Set default weight based on product type
        const weights = getWeightOptions(productData);
        if (weights.length > 0) {
          setSelectedWeight(weights[0].value);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Product not found or could not be loaded.",
          variant: "destructive",
        });
        router.push("/products");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router, toast]);

  const handleAddToCart = async () => {
    if (!product || !selectedWeight) return;

    setIsAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        dispatch({
          type: "ADD_ITEM",
          payload: {
            id: `${product.id}-${selectedWeight}`, // Unique ID for different weights
            name: `${product.name} (${selectedWeight})`,
            price: currentPrice,
            category: product.category,
            image: product.image,
            weight: selectedWeight,
          },
        });
      }
      toast({
        title: "Success",
        description: `Added ${quantity} ${selectedWeight} ${
          quantity === 1 ? "package" : "packages"
        } to cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Check out this product",
          text: product?.description || "Amazing pet food from KibbleDrop",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Success",
          description: "Link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 lg:h-[500px] bg-gray-200 rounded-lg"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link href="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link
            href="/products"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-orange-500 text-white">
                  {product.category}
                </Badge>
              </div>
              {product.featured && (
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-black">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-light mb-4 text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-light text-gray-900">
                  ${currentPrice.toFixed(2)}
                </span>
                <Badge className="bg-orange-100 text-orange-800">
                  {product.petType}
                </Badge>
                {selectedWeight && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {selectedWeight}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Key Features */}
            <div>
              <h3 className="text-lg font-medium mb-3">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  Premium natural ingredients
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  Veterinarian approved formula
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  No artificial preservatives
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  Free delivery on subscription
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Weight/Package Size Selection */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Package Size
                </Label>
                <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select package size" />
                  </SelectTrigger>
                  <SelectContent>
                    {weightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={quantity >= 99}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !selectedWeight}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white py-3 text-lg disabled:opacity-50"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Quality Guarantee</p>
                  <p className="text-xs text-gray-600">Vet approved formula</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">30-Day Returns</p>
                  <p className="text-xs text-gray-600">
                    Satisfaction guaranteed
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Premium Quality</p>
                  <p className="text-xs text-gray-600">Natural ingredients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="nutrition" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            </TabsList>

            <TabsContent value="nutrition" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Protein</span>
                      <span className="text-gray-600">
                        {product.protein || "Min 28%"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Fat</span>
                      <span className="text-gray-600">
                        {product.fat || "Min 15%"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Fiber</span>
                      <span className="text-gray-600">
                        {product.fiber || "Max 4%"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">
                        Moisture
                      </span>
                      <span className="text-gray-600">
                        {product.moisture || "Max 10%"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">
                        Calories
                      </span>
                      <span className="text-gray-600">
                        {product.calories || "3,500 kcal/kg"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Omega-6</span>
                      <span className="text-gray-600">
                        {product.omega6 || "Min 1.4%"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Premium Ingredients</h3>
                    <div className="text-gray-600">
                      {product.ingredients ? (
                        <ul className="space-y-2">
                          {product.ingredients
                            .split(",")
                            .map((ingredient, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-orange-500 mr-2">•</span>
                                <span>{ingredient.trim()}</span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <ul className="space-y-3">
                          <li>• Deboned chicken as the first ingredient</li>
                          <li>
                            • Sweet potatoes and peas for digestible
                            carbohydrates
                          </li>
                          <li>
                            • Chicken meal and salmon meal for added protein
                          </li>
                          <li>• Flaxseed for omega fatty acids</li>
                          <li>
                            • Blueberries and cranberries for antioxidants
                          </li>
                          <li>
                            • No corn, wheat, soy, or artificial preservatives
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
