"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  petType: string;
  image: string;
  featured: boolean;
  protein?: string;
  fat?: string;
  fiber?: string;
  moisture?: string;
  calories?: string;
  omega6?: string;
  ingredients?: string;
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    petType: "",
    image: "",
    featured: false,
    protein: "",
    fat: "",
    fiber: "",
    moisture: "",
    calories: "",
    omega6: "",
    ingredients: "",
  });

  const router = useRouter();
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();

      // Update form data with the uploaded image URL
      setFormData((prev) => ({
        ...prev,
        image: result.url,
      }));

      // Set preview
      setImagePreview(result.url);

      toast({
        title: "Image uploaded successfully",
        description: "Your product image has been uploaded.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const productData = await response.json();
        setProduct(productData);
        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          category: productData.category,
          petType: productData.petType,
          image: productData.image,
          featured: productData.featured,
          protein: productData.protein || "",
          fat: productData.fat || "",
          fiber: productData.fiber || "",
          moisture: productData.moisture || "",
          calories: productData.calories || "",
          omega6: productData.omega6 || "",
          ingredients: productData.ingredients || "",
        });
        // Set image preview if image exists
        if (productData.image) {
          setImagePreview(productData.image);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product. Please try again.",
          variant: "destructive",
        });
        router.push("/admin/products");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [params.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const updatedProduct = await response.json();

      toast({
        title: "Product Updated!",
        description: `${updatedProduct.name} has been updated successfully.`,
      });

      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Update the details for {product.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Premium Dog Food - Chicken & Rice"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="29.99"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the product, its benefits, and ingredients..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Treats">Treats</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Supplements">Supplements</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="petType">Pet Type *</Label>
                <Select
                  value={formData.petType}
                  onValueChange={(value) => handleInputChange("petType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>

              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative w-full max-w-sm">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      width={300}
                      height={300}
                      className="rounded-lg border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Click to upload product image or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      JPEG, PNG, or WebP (max 5MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? "Uploading..." : "Choose Image"}
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <p className="text-sm text-gray-600">
                Upload a high-quality image of your product. Leave empty to keep
                current image.
              </p>
            </div>

            {/* Nutrition Facts Section */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Nutrition Facts (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein">Crude Protein (%)</Label>
                    <Input
                      id="protein"
                      value={formData.protein}
                      onChange={(e) =>
                        handleInputChange("protein", e.target.value)
                      }
                      placeholder="e.g., 26.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fat">Crude Fat (%)</Label>
                    <Input
                      id="fat"
                      value={formData.fat}
                      onChange={(e) => handleInputChange("fat", e.target.value)}
                      placeholder="e.g., 15.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fiber">Crude Fiber (%)</Label>
                    <Input
                      id="fiber"
                      value={formData.fiber}
                      onChange={(e) =>
                        handleInputChange("fiber", e.target.value)
                      }
                      placeholder="e.g., 4.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moisture">Moisture (%)</Label>
                    <Input
                      id="moisture"
                      value={formData.moisture}
                      onChange={(e) =>
                        handleInputChange("moisture", e.target.value)
                      }
                      placeholder="e.g., 10.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories (kcal/kg)</Label>
                    <Input
                      id="calories"
                      value={formData.calories}
                      onChange={(e) =>
                        handleInputChange("calories", e.target.value)
                      }
                      placeholder="e.g., 3500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="omega6">Omega-6 Fatty Acids (%)</Label>
                    <Input
                      id="omega6"
                      value={formData.omega6}
                      onChange={(e) =>
                        handleInputChange("omega6", e.target.value)
                      }
                      placeholder="e.g., 3.0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) =>
                    handleInputChange("ingredients", e.target.value)
                  }
                  placeholder="List all ingredients separated by commas..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  handleInputChange("featured", checked)
                }
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Updating..." : "Update Product"}
              </Button>
              <Button asChild variant="outline" type="button">
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
